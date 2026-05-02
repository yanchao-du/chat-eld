#!/bin/bash
set -e

EIP=$(cd "$(dirname "$0")/../terraform" && terraform output -raw public_ip 2>/dev/null || echo "NOT_DEPLOYED")
KEY="$HOME/.ssh/nanoclaw-poc.pem"

echo "=== Wave 1: Infrastructure ==="
if [ "$EIP" = "NOT_DEPLOYED" ]; then
  echo "FAIL — terraform not applied yet"
else
  ssh -o ConnectTimeout=5 -i "$KEY" "ubuntu@$EIP" \
    "cat ~/setup-complete.txt" && echo "PASS" || echo "FAIL — EC2 not bootstrapped"
fi

echo ""
echo "=== Wave 2: Content ==="
ssh -i "$KEY" "ubuntu@$EIP" \
  "ls ~/nanoclaw/knowledge/wiki/index.md && wc -l ~/nanoclaw/knowledge/wiki/index.md" \
  && echo "PASS" || echo "FAIL — wiki not compiled"

echo ""
echo "=== Wave 3: Agent (WhatsApp + Telegram) ==="
ssh -i "$KEY" "ubuntu@$EIP" \
  "systemctl --user is-active nanoclaw-v2-* 2>/dev/null || systemctl --user list-units 'nanoclaw*'" \
  && echo "PASS" || echo "FAIL — NanoClaw not running"

echo ""
echo "=== Wave 3.5: Web App ==="
if [ -z "$VERCEL_URL" ]; then
  echo "SKIP — set VERCEL_URL=https://your-app.vercel.app to test"
else
  HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$VERCEL_URL")
  [ "$HTTP_STATUS" = "200" ] && echo "PASS" || echo "FAIL — HTTP $HTTP_STATUS"
fi

echo ""
echo "=== Wave 4: Manual checks ==="
echo "WhatsApp: Send 'Where do I vote?' to the bot number."
echo "Telegram: Send 'Where do I vote?' to @eld_info_bot."
echo "Web:      Open \$VERCEL_URL and use the chat widget."
echo "All channels should respond within 5 seconds."
