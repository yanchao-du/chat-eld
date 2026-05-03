# ELD POC — Setup Guide

---

## Prerequisites

- AWS account with SSO enabled
- AWS CLI v2 installed locally
- Terraform ≥ 1.5 installed locally
- A dedicated phone number (SIM) with WhatsApp active — for the bot
- A Telegram account — to create the bot via @BotFather
- Firecrawl API key (free at https://firecrawl.dev — 500 pages/month)
- GovTech PlatformAI API key (`ANTHROPIC_API_KEY`) — for Haiku model access

---

## Wave 1 — Infrastructure

### Step 1.1 — AWS SSO login

```bash
aws configure sso
# Prompts: SSO start URL, region (ap-southeast-1), profile name (default)

aws sso login --profile default
aws sts get-caller-identity --profile default
```

Expected output: JSON with your `Account` ID.

### Step 1.2 — Create EC2 key pair

In the AWS Console (ap-southeast-1 region):

1. EC2 → Key Pairs → Create key pair
2. Name: `nanoclaw-poc`, format: `.pem`
3. Download and secure:

```bash
chmod 400 ~/.ssh/nanoclaw-poc.pem
```

### Step 1.3 — Fill in Terraform variables

```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
```

Edit `terraform/terraform.tfvars`:

```hcl
aws_profile    = "default"
aws_region     = "ap-southeast-1"
instance_type  = "t3.small"      # minimum — t3.micro OOMs during pnpm install
key_pair_name  = "nanoclaw-poc"
my_ip          = "<your public IP>/32"   # curl ifconfig.me
project_name   = "nanoclaw-poc"
volume_size_gb = 20
```

### Step 1.4 — Apply Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

Terraform prints outputs when done:

```
public_ip   = "x.x.x.x"
webapp_url  = "http://x.x.x.x:3001"
ssh_command = "ssh -i ~/.ssh/nanoclaw-poc.pem ubuntu@x.x.x.x"
```

### Step 1.5 — Wait for bootstrap to complete

The EC2 userdata script runs automatically on first boot (~8 minutes). It:
- Installs Node.js 22, Docker, pm2
- Clones NanoClaw and chat-eld repos
- Installs all dependencies
- Builds and starts the Next.js webapp on port 3001 via pm2
- Sets up daily cron jobs (wiki compile + knowledge sync)

Monitor progress:

```bash
ssh -i ~/.ssh/nanoclaw-poc.pem ubuntu@<EIP> 'tail -f /home/ubuntu/setup-complete.txt'
```

Wait until you see: `=== nanoclaw-poc userdata complete`

### Step 1.6 — Verify bootstrap

```bash
ssh -i ~/.ssh/nanoclaw-poc.pem ubuntu@<EIP>
node --version          # v22.x
ls ~/nanoclaw           # NanoClaw repo present
ls ~/chat-eld           # chat-eld repo present
pm2 list                # eld-webapp should be listed (may show errored until Step 2.2)
```

---

## Wave 2 — Webapp

### Step 2.1 — Set the API key

On EC2:

```bash
echo 'ANTHROPIC_API_KEY=<your-key>' > ~/chat-eld/webapp/.env.local
```

### Step 2.2 — Build and start the webapp

```bash
cd ~/chat-eld/webapp
npm run build
pm2 restart eld-webapp || pm2 start npm --name "eld-webapp" -- start -- -p 3001
pm2 save
```

### Step 2.3 — Verify webapp

Open `http://<EIP>:3001` in your browser. You should see the mock ELD website with a chat widget in the bottom-right corner.

Send a test message: `How do I register to vote?`

Expected: a response from ELDBot (may use the bundled knowledge until Wave 3 knowledge sync is complete).

---

## Wave 3 — ELD Knowledge Base

Run these commands on EC2 from `~/nanoclaw`:

### Step 3.1 — Scrape ELD content

```bash
cd ~/nanoclaw
FIRECRAWL_API_KEY=<your-key> node scripts/scrape-eld.js
```

Output goes to `~/nanoclaw/knowledge/eld/`. Expect ~10–20 pages scraped.

### Step 3.2 — Compile wiki

```bash
node scripts/wiki-compile.js
```

Output goes to `~/nanoclaw/knowledge/wiki/sources/`.

### Step 3.3 — Sync knowledge to webapp

```bash
bash scripts/sync-knowledge.sh
```

This copies `knowledge/wiki/sources/*.md` → `~/chat-eld/webapp/knowledge/`.
The webapp reads knowledge on every request — no restart needed.

### Step 3.4 — Lint wiki

```bash
node scripts/wiki-lint.js
```

Expected output: `Lint PASSED`.

> **Cron automation**: Steps 3.2 and 3.3 run automatically every day at 18:00 SGT. The lint runs every Friday at 16:00 SGT. You only need to run the scraper manually when ELD content changes.

---

## Wave 4 — NanoClaw Agent (WhatsApp + Telegram)

### Step 4.1 — Install NanoClaw

SSH to EC2, then:

```bash
bash ~/nanoclaw/nanoclaw.sh
```

Choose: **Standard setup**. Enter your `ANTHROPIC_API_KEY` when prompted.

### Step 4.2 — Connect WhatsApp

Inside the NanoClaw session:

```
/add-whatsapp
```

Choose: pairing code. Enter your dedicated bot number: `+65xxxxxxxx`.

On your phone: WhatsApp → Settings → Linked Devices → Link a Device → enter the 8-digit code shown.

### Step 4.3 — Connect Telegram

1. Open Telegram → message @BotFather
2. `/newbot` → Name: `ELD Info Bot` → Username: `eld_info_bot`
3. Copy the bot token, then inside NanoClaw:

```
/add-telegram
# Enter token when prompted
```

### Step 4.4 — Verify channels

Send `Where do I vote?` to both the WhatsApp number and the Telegram bot. Both should respond within 5 seconds with an answer grounded in ELD content.

---

## Testing

### Web chat widget

1. Open `http://<EIP>:3001`
2. Click the chat bubble (bottom-right)
3. Test questions:
   - `How do I register to vote?`
   - `What should I bring to the polling station?`
   - `Can I vote overseas?`
   - `What is the minimum voting age?`
   - `Tell me your NRIC` ← should refuse and not echo personal data

### WhatsApp

Send the same questions to the bot number. Verify answers cite ELD sources.

### Telegram

Send the same questions to `@eld_info_bot`.

### Knowledge freshness check

After running the scraper + compile + sync:

```bash
ls -la ~/chat-eld/webapp/knowledge/    # should show recently modified .md files
```

---

## Tear-down (cost saving)

```bash
cd terraform && terraform destroy
```

WhatsApp session is stored on EBS. EC2 **stop/start** (`terraform apply` / stopping the instance) preserves the session. Only `terraform destroy` loses it — re-pairing required on next deploy.

---

## Updating knowledge manually

```bash
cd ~/nanoclaw
FIRECRAWL_API_KEY=<your-key> node scripts/scrape-eld.js
node scripts/wiki-compile.js
bash scripts/sync-knowledge.sh
node scripts/wiki-lint.js
```

---

## Updating code (after git push)

```bash
cd ~/chat-eld && git pull
cd webapp && npm run build && pm2 restart eld-webapp
```
