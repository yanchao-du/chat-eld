#!/bin/bash
set -euo pipefail

LOG=/home/ubuntu/setup-complete.txt
exec > >(tee -a $LOG) 2>&1
echo "=== ${project_name} userdata started at $(date) ==="

# ── Wait for apt lock ─────────────────────────────────────────────────────────
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do sleep 2; done

apt-get update -y
apt-get install -y gcc python3 make git curl jq

# ── Swap (2 GB) — prevents OOM during Docker image builds ────────────────────
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# ── Docker Engine ─────────────────────────────────────────────────────────────
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu
systemctl enable docker
systemctl start docker

# ── Node.js 22 via nvm (ubuntu user) ─────────────────────────────────────────
su - ubuntu -c '
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  nvm install 22
  nvm use 22
  nvm alias default 22
  corepack enable
'

# ── Clone NanoClaw + install dependencies ────────────────────────────────────
su - ubuntu -c '
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"

  git clone https://github.com/qwibitai/nanoclaw.git /home/ubuntu/nanoclaw
  cd /home/ubuntu/nanoclaw
  pnpm install --no-frozen-lockfile
'

# ── Clone chat-eld repo + copy scripts into nanoclaw ─────────────────────────
su - ubuntu -c '
  git clone https://github.com/yanchao-du/chat-eld.git /home/ubuntu/chat-eld

  # Copy scripts (with their package.json so type=commonjs is respected)
  cp /home/ubuntu/chat-eld/scripts/scrape-eld.js       /home/ubuntu/nanoclaw/scripts/
  cp /home/ubuntu/chat-eld/scripts/wiki-compile.js     /home/ubuntu/nanoclaw/scripts/
  cp /home/ubuntu/chat-eld/scripts/wiki-lint.js        /home/ubuntu/nanoclaw/scripts/
  cp /home/ubuntu/chat-eld/scripts/sync-knowledge.sh   /home/ubuntu/nanoclaw/scripts/
  cp /home/ubuntu/chat-eld/scripts/package.json        /home/ubuntu/nanoclaw/scripts/
  chmod +x /home/ubuntu/nanoclaw/scripts/sync-knowledge.sh

  # Copy agent config
  mkdir -p /home/ubuntu/nanoclaw/groups/election-bot
  cp /home/ubuntu/chat-eld/groups/election-bot/CLAUDE.md   /home/ubuntu/nanoclaw/groups/election-bot/
  cp /home/ubuntu/chat-eld/groups/election-bot/config.json /home/ubuntu/nanoclaw/groups/election-bot/

  # Pre-create knowledge directories
  mkdir -p /home/ubuntu/nanoclaw/knowledge/eld
  mkdir -p /home/ubuntu/nanoclaw/knowledge/wiki
'

# ── Webapp: install pm2, build Next.js app, start as service ─────────────────
su - ubuntu -c '
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"

  npm install -g pm2

  cd /home/ubuntu/chat-eld/webapp
  npm install
  npm run build
  PORT=3001 pm2 start npm --name "eld-webapp" -- start -- -p 3001
  pm2 save
'

# pm2 startup so webapp survives reboots (must run as root to install the service)
env PATH="$(su - ubuntu -c 'export NVM_DIR=$HOME/.nvm; source $NVM_DIR/nvm.sh; echo $PATH')":$PATH \
  $(su - ubuntu -c 'export NVM_DIR=$HOME/.nvm; source $NVM_DIR/nvm.sh; which pm2') \
  startup systemd -u ubuntu --hp /home/ubuntu || true
systemctl enable pm2-ubuntu || true

# ── Pre-pull NanoClaw Docker base image (so nanoclaw.sh sandbox build is fast)# Run as ubuntu so docker group membership applies
su - ubuntu -c '
  docker pull node:22-slim || true
  docker pull ubuntu:24.04 || true
' || true

# ── Cron jobs: daily wiki compile + weekly lint ───────────────────────────────
su - ubuntu -c '
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  NODE_BIN=$(which node)

  (crontab -l 2>/dev/null; echo "0 18 * * *   cd /home/ubuntu/nanoclaw && $NODE_BIN scripts/wiki-compile.js >> /home/ubuntu/wiki-compile.log 2>&1 && bash scripts/sync-knowledge.sh >> /home/ubuntu/wiki-compile.log 2>&1") | crontab -
  (crontab -l 2>/dev/null; echo "0 16 * * 5   cd /home/ubuntu/nanoclaw && $NODE_BIN scripts/wiki-lint.js >> /home/ubuntu/wiki-lint.log 2>&1") | crontab -
'

echo "=== ${project_name} userdata complete at $(date) ==="
echo ""
echo "Manual steps remaining:"
echo "  1. SSH in and run: bash ~/nanoclaw/nanoclaw.sh"
echo "     - Choose: Standard setup"
echo "     - Enter ANTHROPIC_API_KEY when prompted"
echo "  2. Add ANTHROPIC_API_KEY for the webapp:"
echo "     echo 'ANTHROPIC_API_KEY=<your-key>' > ~/chat-eld/webapp/.env.local"
echo "     cd ~/chat-eld/webapp && npm run build && pm2 restart eld-webapp"
echo "  3. Inside NanoClaw: /add-whatsapp (pairing code)"
echo "  4. Inside NanoClaw: /add-telegram (enter BotFather token)"
echo "  5. Run scraper: FIRECRAWL_API_KEY=xxx node ~/nanoclaw/scripts/scrape-eld.js"
echo "  6. Compile wiki + sync to webapp:"
echo "     cd ~/nanoclaw && node scripts/wiki-compile.js && bash scripts/sync-knowledge.sh"
echo "  7. Lint wiki: node ~/nanoclaw/scripts/wiki-lint.js"
echo "  8. Webapp is running at http://localhost:3001 (open port 3001 in security group if needed)"
chown ubuntu:ubuntu /home/ubuntu/setup-complete.txt
