# ELD POC — Setup Guide

Step-by-step prerequisites for deploying the NanoClaw agent on AWS EC2.

---

## Prerequisites

- AWS account with SSO enabled
- AWS CLI v2 installed locally
- Terraform ≥ 1.5 installed locally
- Node.js 18+ installed locally
- A dedicated phone number (SIM) with WhatsApp active — for the bot
- A Telegram account — to create the bot via @BotFather
- Firecrawl API key (free at https://firecrawl.dev, 500 pages/month)

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
instance_type  = "t3.micro"
key_pair_name  = "nanoclaw-poc"
my_ip          = "<your public IP>/32"   # curl ifconfig.me
project_name   = "nanoclaw-poc"
volume_size_gb = 20
```

### Step 1.4–1.9 — Apply Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
```

Wait ~3 minutes for EC2 bootstrap, then verify:

```bash
ssh -i ~/.ssh/nanoclaw-poc.pem ubuntu@<EIP>
cat ~/setup-complete.txt     # should show timestamp
docker ps                    # should be clean
node --version               # v22.x
ls ~/nanoclaw                # NanoClaw repo present
```

---

## Wave 2 — ELD Content

### Step 2.1 — Scrape ELD content

```bash
FIRECRAWL_API_KEY=your_key node scripts/scrape-eld.js
```

Output goes to `knowledge/eld/`.

### Step 2.2 — Compile wiki

```bash
node scripts/wiki-compile.js
```

### Step 2.3 — Lint wiki

```bash
node scripts/wiki-lint.js
```

Expect: `Lint PASSED`.

### Step 2.4 — Set up cron jobs on EC2

SSH to EC2, then:

```bash
crontab -e
```

Add:
```
0 18 * * *   cd /home/ubuntu/nanoclaw && node scripts/wiki-compile.js >> /home/ubuntu/wiki-compile.log 2>&1
0 16 * * 5   cd /home/ubuntu/nanoclaw && node scripts/wiki-lint.js >> /home/ubuntu/wiki-lint.log 2>&1
```

---

## Wave 3 — NanoClaw Agent

### Step 3.1 — Install NanoClaw

```bash
bash nanoclaw.sh
```

### Step 3.2 — Register API key

Inside Claude Code on EC2, register your `ANTHROPIC_API_KEY` in the OneCLI vault.

### Step 3.3 — Copy agent config

```bash
cp -r groups/election-bot ~/nanoclaw/groups/
```

### Step 3.4 — Copy wiki knowledge

```bash
cp -r knowledge/wiki ~/nanoclaw/knowledge/
```

### Step 3.5 — Link WhatsApp (pairing code)

```bash
/add-whatsapp
# Choose: pairing code
# Enter your dedicated bot number: +65xxxxxxxx
# On phone: WhatsApp → Settings → Linked Devices → Link a Device → enter 8-digit code
```

### Step 3.6 — Add Telegram bot

1. Open Telegram → message @BotFather
2. `/newbot` → Name: `ELD Info Bot` → Username: `eld_info_bot`
3. Copy the bot token, then on EC2:

```bash
/add-telegram
# Enter token when prompted
```

### Step 3.7 — Verify both channels

Send `Where do I vote?` to both the WhatsApp bot number and the Telegram bot. Both should respond within 5 seconds with an answer grounded in ELD content.

If no response, call ELD at 1800-225-5353 to verify the polling day schedule is current.

---

## Tear-down (cost saving)

Always destroy when not in use — EIP costs $0.005/hr while instance is stopped:

```bash
cd terraform && terraform destroy
```

WhatsApp session is stored on EBS. EC2 **stop/start** preserves it. Only `terraform destroy` loses the WhatsApp session (re-pairing required).

---

## Health check

```bash
bash scripts/verify-poc.sh
```
