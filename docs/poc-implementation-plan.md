# Election Call Centre Bot — POC Implementation Plan

## Executive Summary

| | |
|---|---|
| **Goal** | WhatsApp + Telegram bot + mock ELD web app answering voter questions, grounded in official ELD content |
| **Stack** | AWS EC2 + Terraform + NanoClaw + Firecrawl + LLM Wiki (Nimbalyst) + Claude API (Haiku 4.5) + Next.js web app |
| **Cost** | ~$0 (all free tiers) |
| **Total time** | 8–10 hours (focused weekend session) |
| **Waves** | 5 waves, 3 sequential gates |
| **Commits** | 16 atomic commits |

---

## Architecture

```
Voter entry points:
  1. WhatsApp  (primary)
  2. Telegram  (backup)
  3. Web chat  (mock ELD website, no app install)
           │
           ▼
┌─────────────────────────────────────────────┐
│         AWS EC2 t3.micro (ap-southeast-1)    │
│         Ubuntu 24.04, Elastic IP             │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  NanoClaw (systemd service)          │   │
│  │  - WhatsApp via Baileys              │   │
│  │  - Telegram via Grammy Bot API       │   │
│  │  - Claude Agent SDK (Haiku 4.5)      │   │
│  │  - Reads /knowledge/wiki/            │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  LLM Wiki (Nimbalyst pattern)        │   │
│  │  /knowledge/wiki/                    │   │
│  │  - Compiled from ELD markdown        │   │
│  │  - Daily cron: recompile             │   │
│  │  - Weekly cron: lint/health check    │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │  ELD Scraper (Firecrawl)             │   │
│  │  /knowledge/eld/                     │   │
│  │  - Scrape eld.gov.sg HTML + PDFs     │   │
│  │  - Output: clean markdown per topic  │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
           ↑ managed via Terraform + SSH
```

---

## Wave Execution Map

```
WAVE 1 (Infrastructure)      WAVE 2 (Content)           WAVE 3 (Agent)         WAVE 3.5 (Web App)     WAVE 4 (QA)
────────────────────         ────────────────           ──────────────         ──────────────────     ──────────
aws configure sso            Firecrawl signup*          NanoClaw install       Next.js scaffold       10 voter Q tests
terraform.tfvars             Scrape ELD site            CLAUDE.md persona      ELD branding           Edge case tests
terraform apply              Clean → markdown           WhatsApp pairing       Chat widget            Consistency tests
SSH verify                   Wiki bootstrap             Telegram bot setup     /api/chat → Haiku      Latency tests
                             Cron: daily compile        systemd service        Deploy Vercel          Document results
                             Cron: lint weekly          Stop/start test

*can run in parallel during terraform apply wait
**Wave 3.5 can run in parallel with Wave 3 (no EC2 dependency)

GATE 1 ──────────────────────┘
(EC2 live + SSH works)

                             GATE 2 ─────────────────────┘
                             (wiki/ populated)

                                                         GATE 3 ────────────────┘
                                                         (bot responds on WhatsApp + Telegram)

                                                                                GATE 3.5 ──────────────┘
                                                                                (web chat works in browser)
```

---

## Wave 1 — Infrastructure (Est: 1.5 hours)

### Tasks

| # | Task | Est | QA Verification |
|---|------|-----|-----------------|
| 1.1 | Run `aws configure sso` — enter org SSO start URL, select account + role, profile name = `default` | 5m | `aws sts get-caller-identity --profile default` returns account ID |
| 1.2 | Create EC2 key pair in ap-southeast-1 console → download `.pem` → `chmod 400 ~/.ssh/nanoclaw-poc.pem` | 5m | `ls -la ~/.ssh/nanoclaw-poc.pem` shows permissions `-r--------` |
| 1.3 | Copy `terraform/terraform.tfvars.example` → `terraform/terraform.tfvars`, fill in real values | 5m | No placeholder values remain (`grep "your-" terraform.tfvars` returns empty) |
| 1.4 | `terraform init` — downloads AWS provider | 3m | No errors, `.terraform/` directory created |
| 1.5 | `terraform plan` — review what will be created | 5m | Plan shows exactly 4 resources: SG, instance, EIP, EIP association. Zero errors. |
| 1.6 | `terraform apply -auto-approve` | 5m | Outputs: `instance_id`, `public_ip`, `ssh_command` printed |
| 1.7 | Wait ~3 minutes for userdata bootstrap, then SSH in | 5m | `ssh -i ~/.ssh/nanoclaw-poc.pem ubuntu@<EIP>` connects |
| 1.8 | Verify bootstrap complete | 3m | `cat ~/setup-complete.txt` shows timestamp |
| 1.9 | Verify Docker + Node + NanoClaw | 5m | `docker ps` clean, `node --version` = v22.x, `ls ~/nanoclaw` shows repo |

### tfvars to fill in

```hcl
aws_profile    = "default"
aws_region     = "ap-southeast-1"
instance_type  = "t3.micro"
key_pair_name  = "nanoclaw-poc"
my_ip          = "<output of: curl ifconfig.me>/32"
project_name   = "nanoclaw-poc"
volume_size_gb = 20
```

### SSO refresh (when token expires)

```bash
aws sso login --profile default
```

### Risks

| Risk | Mitigation |
|------|-----------|
| AMI filter no results | Run: `aws ec2 describe-images --filters "Name=name,Values=ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*" --owners 099720109477 --region ap-southeast-1` to verify |
| t3.micro free tier expired (account >12 months old) | Check billing dashboard. If expired: change `instance_type = "t3.small"` in tfvars (~$15/mo) |
| Key pair region mismatch | Ensure key pair created specifically in ap-southeast-1 |
| Elastic IP cost while stopped | EIP costs $0.005/hr when instance is stopped. Always `terraform destroy` when not using. |

### Commits

```
feat(terraform): verify AMI filter resolves in ap-southeast-1
feat(infra): add verify-poc.sh health check script
```

---

## Wave 2 — ELD Content Scraping + Wiki (Est: 2.5 hours)

**Can begin Firecrawl signup in parallel during Wave 1 terraform apply (5 min wait).**

### Prerequisites
- Gate 1 passed (EC2 live, SSH works)
- Firecrawl API key obtained at firecrawl.dev (free tier, 500 pages/month)

### Tasks

| # | Task | Est | QA Verification |
|---|------|-----|-----------------|
| 2.1 | Sign up at firecrawl.dev, get free API key | 5m | API key string in hand |
| 2.2 | SSH to EC2, install Firecrawl SDK: `cd ~/nanoclaw && npm install @mendable/firecrawl-js` | 5m | No install errors |
| 2.3 | Create `scripts/scrape-eld.js` — scrape priority URLs (see list below) | 20m | `node scripts/scrape-eld.js` runs without errors |
| 2.4 | Run scraper — priority HTML pages + PDFs | 20m | Markdown files exist in `~/nanoclaw/knowledge/eld/` |
| 2.5 | Run full site crawl (`crawlUrl` on `https://www.eld.gov.sg`) | 20m | Additional pages captured (≤500 page limit) |
| 2.6 | Clean + organise into 6 topic files (see structure below) | 30m | 6 files with correct content, no raw HTML fragments |
| 2.7 | Bootstrap wiki: create `knowledge/wiki/` directory structure | 10m | `index.md`, `log.md`, `entities/`, `concepts/`, `sources/` created |
| 2.8 | Run initial wiki compilation — ingest all 6 topic files | 20m | `wiki/index.md` lists ≥6 pages with valid `[[wikilinks]]` |
| 2.9 | Set up cron: daily compile at 6pm SGT | 10m | `crontab -l` shows entry, manual test run succeeds |
| 2.10 | Set up cron: weekly lint Fridays 4pm SGT | 5m | `crontab -l` shows second entry |

### Priority scrape URLs

```
HTML pages:
  https://www.eld.gov.sg/voters.html
  https://www.eld.gov.sg/faq.html
  https://www.eld.gov.sg/candidate_parliamentary_publication.html
  https://www.eld.gov.sg/candidate_parliamentary_forms.html
  https://www.eld.gov.sg/70th_process_destruction.html

PDFs:
  https://www.eld.gov.sg/pdf/GE2025_HowToVote_Brochure_EL.pdf
  https://www.eld.gov.sg/pdf/GE2025/13i%20Guide%20for%20Polling%20Agents%20of%20General%20Election%202025.pdf
  https://www.eld.gov.sg/press/2025/Media%20Release%20on%20General%20Election%202025.pdf
  https://www.eld.gov.sg/Resources/Presidential%20Elections%20Act%201991.pdf
```

### Output knowledge structure

```
~/nanoclaw/knowledge/
  eld/                          ← raw scraped markdown (source of truth)
    voter-registration.md
    how-to-vote.md
    polling-procedures.md
    faq-general.md
    electoral-divisions.md
    overseas-voting.md
    media-releases/
      ge2025-writ.md
  wiki/                         ← LLM Wiki compiled output
    index.md                    ← master index with [[wikilinks]]
    log.md                      ← compilation log
    entities/                   ← entity pages (Polling Station, Electoral Division, etc.)
    concepts/                   ← concept pages (Compulsory Voting, GRC, SMC, etc.)
    sources/                    ← source-linked pages
    lint-reports/               ← weekly health check reports
```

### Scraper script (`scripts/scrape-eld.js`)

```javascript
const FirecrawlApp = require('@mendable/firecrawl-js').default;
const fs = require('fs');
const path = require('path');

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
const OUTPUT_DIR = path.join(__dirname, '../knowledge/eld');

const PRIORITY_URLS = [
  'https://www.eld.gov.sg/voters.html',
  'https://www.eld.gov.sg/faq.html',
  'https://www.eld.gov.sg/candidate_parliamentary_publication.html',
  'https://www.eld.gov.sg/pdf/GE2025_HowToVote_Brochure_EL.pdf',
  'https://www.eld.gov.sg/pdf/GE2025/13i%20Guide%20for%20Polling%20Agents%20of%20General%20Election%202025.pdf',
];

async function scrape() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const url of PRIORITY_URLS) {
    console.log(`Scraping: ${url}`);
    const result = await app.scrapeUrl(url, { formats: ['markdown'] });
    const filename = url.split('/').pop().replace('.html', '').replace('.pdf', '') + '.md';
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), result.markdown);
    console.log(`  → saved: ${filename}`);
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('Priority URLs done. Running full crawl...');
  const crawl = await app.crawlUrl('https://www.eld.gov.sg', {
    limit: 100,
    scrapeOptions: { formats: ['markdown'] }
  });

  for (const page of crawl.data) {
    const slug = page.metadata?.sourceURL?.replace('https://www.eld.gov.sg/', '').replace(/\//g, '-') || 'unknown';
    fs.writeFileSync(path.join(OUTPUT_DIR, `crawl-${slug}.md`), page.markdown || '');
  }

  console.log(`Done. ${crawl.data.length} pages scraped.`);
}

scrape().catch(console.error);
```

Run with:
```bash
FIRECRAWL_API_KEY=your_key node scripts/scrape-eld.js
```

### Cron setup

```bash
# Edit crontab
crontab -e

# Add these two lines:
0 18 * * * cd /home/ubuntu/nanoclaw && node scripts/wiki-compile.js >> /home/ubuntu/wiki-compile.log 2>&1
0 16 * * 5 cd /home/ubuntu/nanoclaw && node scripts/wiki-lint.js >> /home/ubuntu/wiki-lint.log 2>&1
```

### Risks

| Risk | Mitigation |
|------|-----------|
| ELD blocks Firecrawl cloud IPs | Fallback: `curl` + manual save. ELD is a public static site, unlikely to block. |
| PDF markdown quality poor | Budget 15 extra minutes for manual cleanup of the 2 PDFs. Focus on voter brochure. |
| 500-page free limit hit | ELD site is ~50–100 pages. Well within limit. |
| Cron fails silently | Output redirected to log files. Add `tail -f ~/wiki-compile.log` to verify. |

### Commits

```
feat(scraper): add Firecrawl-based ELD scrape script
feat(knowledge): add cleaned ELD topic markdown files
feat(wiki): bootstrap LLM Wiki structure (Nimbalyst pattern)
feat(wiki): initial compilation of ELD content into wiki pages
feat(automation): add daily compile + weekly lint cron jobs
```

---

## Wave 3 — NanoClaw + WhatsApp + Telegram (Est: 2 hours)

### Prerequisites
- Gate 2 passed (`wiki/index.md` populated, ≥6 linked pages)
- Anthropic API key (Haiku) — already in hand, no signup needed
- Dedicated SIM / spare phone number with WhatsApp active
- Telegram account (to create bot via @BotFather)

### Tasks

| # | Task | Est | QA Verification |
|---|------|-----|-----------------|
| 3.1 | Have Anthropic API key ready (Haiku — already obtained, no signup needed) | 0m | API key string confirmed |
| 3.2 | Run `bash nanoclaw.sh` on EC2 — follow installer prompts | 15m | Installer completes without errors |
| 3.3 | Register Anthropic API key in NanoClaw (OneCLI vault) | 5m | CLI agent responds to a test message |
| 3.4 | Create `groups/election-bot/CLAUDE.md` — election agent persona | 15m | File exists with all required sections |
| 3.5 | Configure knowledge mount — point agent at `knowledge/wiki/` | 10m | Agent can read wiki files during test query |
| 3.6 | Run `/add-whatsapp` inside Claude Code — choose pairing code | 15m | Pairing code received, WhatsApp shows "Linked" under Linked Devices |
| 3.7 | Set `requiresTrigger: false` for DMs | 5m | Config updated in source |
| 3.8 | Verify systemd service auto-installed by NanoClaw setup | 5m | `systemctl --user status nanoclaw-v2-*` shows `active (running)` |
| 3.9 | Create Telegram bot via @BotFather: `/newbot` → name "ELD Info Bot" → username `eld_info_bot` | 5m | Bot token string received (format: `123456:ABC-DEF...`) |
| 3.10 | Run `/add-telegram` in NanoClaw — enter bot token | 10m | NanoClaw connects to Telegram; send `/start` to bot and get response |
| 3.11 | Test Telegram: send same 3 test questions via Telegram vs WhatsApp | 10m | Answers are substantively identical on both channels |
| 3.12 | Test stop/start: `terraform destroy` then `terraform apply` | 10m | After recreate, both bots reconnect and respond |

> **Note on 3.12:** Full `terraform destroy` + `apply` will require re-pairing WhatsApp (new instance). Telegram bot token is persistent — no re-pairing needed after recreate. For day-to-day, use EC2 stop/start (preserves EBS + session files).

### CLAUDE.md — Election Agent Persona

Save to `~/nanoclaw/groups/election-bot/CLAUDE.md`:

```markdown
# ELDBot — Singapore Election Information Assistant

## Role
You are an official election information assistant. You answer voter questions
about Singapore elections, grounded exclusively in official ELD content.

## Knowledge Files
Read from /workspace/knowledge/wiki/ — use [[slug]] cross-references.
Cite the specific wiki page at the end of every answer.

## Rules
- ONLY answer questions about Singapore elections, voting, and electoral processes
- Ground ALL answers in /knowledge/wiki/ files — never invent information
- Never give political opinions, party recommendations, or candidate assessments
- If topic not covered: "I don't have that information. Please contact ELD at
  1800-225-5353 or visit www.eld.gov.sg"
- Keep responses concise: 2–4 sentences maximum
- Use plain, neutral language accessible to all Singaporeans
- Never store, echo, or process personal data (NRIC, address, phone number)
- If asked for personal data: "I cannot process personal information. Please
  use the official ELD portal at www.eld.gov.sg for account-specific queries."
- End every answer with the source: _(Source: ELD — [page name])_

## Tone
Factual, neutral, helpful. Bullet points for multi-step procedures.
```

### Telegram setup

```bash
# 1. Open Telegram, message @BotFather
/newbot
# Name: ELD Info Bot
# Username: eld_info_bot (or any available @username)
# → BotFather returns a token: 123456789:ABCdef...

# 2. Inside NanoClaw on EC2:
/add-telegram
# Enter the token when prompted
```

### WhatsApp pairing (headless server)

```bash
# Inside Claude Code on the EC2 instance:
/add-whatsapp

# When prompted, choose: "pairing code"
# Enter your dedicated bot number: +65xxxxxxxx
# Open WhatsApp on that phone:
#   Settings → Linked Devices → Link a Device → enter the 8-digit code
```

### Risks

| Risk | Mitigation |
|------|-----------|
| WhatsApp bans number (Baileys = unofficial client) | Use dedicated SIM only. Low POC volume unlikely to trigger ban. |
| NanoClaw installer hangs on EC2 | SSH with `-t` flag for pseudo-terminal: `ssh -t -i key.pem ubuntu@ip` |
| Anthropic $5 credit burns quickly | Use `claude-3-haiku` model (cheapest). $5 ≈ 20M input tokens ≈ months at POC volume. |
| Baileys session invalidated after instance recreate | Session stored in EBS. EC2 stop/start preserves it. Only `terraform destroy` loses it. |
| Telegram `@username` already taken | Try variations: `eld_sg_bot`, `eldvoterbot`, etc. Username doesn't affect functionality. |

### Commits

```
feat(agent): add election-bot CLAUDE.md persona
feat(agent): add knowledge mount config for wiki/ directory
feat(agent): configure requiresTrigger false for public DMs
feat(agent): add Telegram bot via NanoClaw /add-telegram
```

---

## Wave 3.5 — Mock ELD Web App (Est: 1.5 hours)

> **Can run in parallel with Wave 3** — no EC2 dependency. Web app runs on Vercel free tier, calls Claude API directly.

### Prerequisites
- Anthropic API key (same Haiku key)
- Vercel account (free, sign up at vercel.com with GitHub)
- Node 18+ on local machine

### Overview

A Next.js app (`/webapp`) styled to look like the official ELD website. Includes a floating chat widget that calls Claude Haiku 4.5 directly from the browser (via a Next.js API route). ELD markdown content is bundled as static files in `webapp/knowledge/` and injected into the system prompt.

### Architecture

```
Browser → mock ELD website (Vercel)
            └─ Chat widget (bottom-right floating button)
                  └─ POST /api/chat
                        └─ Anthropic Claude Haiku 4.5
                              └─ System prompt includes bundled ELD knowledge
```

### Tasks

| # | Task | Est | QA Verification |
|---|------|-----|-----------------|
| 3.5.1 | Scaffold Next.js app: `npx create-next-app@latest webapp --typescript --tailwind --app` | 5m | `cd webapp && npm run dev` starts on localhost:3000 |
| 3.5.2 | Install Anthropic SDK: `npm install @anthropic-ai/sdk` | 2m | No install errors |
| 3.5.3 | Create `/webapp/app/api/chat/route.ts` — POST handler → Claude Haiku 4.5 | 15m | `curl -X POST localhost:3000/api/chat -d '{"message":"test"}'` returns JSON |
| 3.5.4 | Create `webapp/knowledge/` — copy ELD markdown files (or use placeholder content until Wave 2 done) | 10m | 5+ markdown files in `webapp/knowledge/` |
| 3.5.5 | Create `ELDHeader.tsx` — mock ELD navigation bar with Singapore red (#C8102E) | 15m | Header renders with Home / Voters / Candidates / FAQs nav links |
| 3.5.6 | Create `ChatWidget.tsx` — floating chat button + slide-up panel with message history | 20m | Widget opens/closes, sends messages, displays bot responses |
| 3.5.7 | Create mock ELD homepage (`app/page.tsx`) with hero section and key voter links | 15m | Homepage renders, chat widget visible bottom-right |
| 3.5.8 | Create `.env.local` with `ANTHROPIC_API_KEY=sk-...` | 2m | Chat widget returns real Claude responses |
| 3.5.9 | Deploy to Vercel: `npx vercel --prod`, add env var `ANTHROPIC_API_KEY` in Vercel dashboard | 10m | Public URL accessible, chat widget works |
| 3.5.10 | Smoke test: ask 3 voter questions via web chat widget | 5m | Correct grounded answers, ELD branding intact |

### File Structure

```
webapp/
  app/
    page.tsx              ← mock ELD homepage (hero + voter info cards)
    layout.tsx            ← ELD header/footer wrapping all pages
    voters/page.tsx       ← voter info page
    faq/page.tsx          ← FAQ page
    api/
      chat/
        route.ts          ← POST /api/chat → Claude Haiku 4.5
  components/
    ChatWidget.tsx        ← floating button + slide-up chat panel
    ChatMessage.tsx       ← message bubble (user vs bot styling)
    ELDHeader.tsx         ← mock ELD nav bar (Singapore red)
  lib/
    knowledge.ts          ← reads webapp/knowledge/*.md, builds system prompt
    claude.ts             ← Anthropic client (reads ANTHROPIC_API_KEY)
  knowledge/              ← ELD markdown files (bundled at build time)
    faq.md
    how-to-vote.md
    voter-registration.md
    polling-procedures.md
    overseas-voting.md
  public/
    eld-logo.png          ← placeholder ELD logo
  .env.local              ← ANTHROPIC_API_KEY (not committed)
  .env.example            ← template
  vercel.json             ← optional: set region to sin1
```

### Key implementation details

**`/api/chat/route.ts`** — system prompt includes all knowledge files + same persona as CLAUDE.md:
```typescript
import Anthropic from '@anthropic-ai/sdk';
import { loadKnowledge } from '@/lib/knowledge';

export async function POST(req: Request) {
  const { message, history } = await req.json();
  const knowledge = await loadKnowledge();
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: `You are an official ELD election information assistant for Singapore.
Answer ONLY election-related questions, grounded in the knowledge below.
Keep answers to 2–4 sentences. End with _(Source: ELD — [topic])_.
If topic not covered: "I don't have that. Please contact ELD at 1800-225-5353."

KNOWLEDGE:
${knowledge}`,
    messages: [...history, { role: 'user', content: message }],
  });

  return Response.json({ reply: response.content[0].text });
}
```

**`ChatWidget.tsx`** — floating button, slide-up panel, streaming-ready:
- Singapore red (#C8102E) send button
- User messages right-aligned (red), bot messages left-aligned (white card)
- Typing indicator (3 dots) while waiting for response
- "Powered by Claude" attribution footer

### Vercel deployment

```bash
cd webapp
npx vercel          # follow prompts, link to your account
# In Vercel dashboard: Settings → Environment Variables → Add ANTHROPIC_API_KEY
npx vercel --prod   # deploy to production URL
```

### Risks

| Risk | Mitigation |
|------|-----------|
| ANTHROPIC_API_KEY exposed in frontend | API key is server-side only (Next.js API route, never sent to browser) |
| Vercel free tier cold starts | Acceptable for POC (~500ms first request). Not an issue at low volume. |
| Knowledge files not matching EC2 content | Copy EC2 `knowledge/eld/` files into `webapp/knowledge/` after Wave 2 completes. Use placeholder FAQs for Wave 3.5 initial deploy. |
| Singapore red rendering varies | Use hex `#C8102E` explicitly. Test in Chrome and Safari. |

### Commits

```
feat(webapp): scaffold Next.js mock ELD website with Tailwind
feat(webapp): add /api/chat route with Claude Haiku 4.5 and ELD knowledge
feat(webapp): add ELDHeader navigation component
feat(webapp): add ChatWidget floating component
feat(webapp): deploy mock ELD website to Vercel
```

---

## Wave 4 — QA & Validation (Est: 1.5 hours)

### Prerequisites
- Gate 3 passed (bot responds on WhatsApp + Telegram)
- Gate 3.5 passed (web chat works in browser)

### Tasks

| # | Task | Est | QA Verification |
|---|------|-----|-----------------|
| 4.1 | Send 10 standard voter questions via WhatsApp (test matrix below) | 20m | All 10 answered correctly, grounded in ELD content |
| 4.2 | Repeat same 10 questions via Telegram | 10m | Answers substantively identical to WhatsApp |
| 4.3 | Repeat same 10 questions via web chat widget | 10m | Answers substantively identical across all 3 channels |
| 4.4 | Send 3 political questions (any channel) | 10m | All 3 declined gracefully with hotline redirect |
| 4.5 | Send 2 personal data requests (any channel) | 5m | Both declined, no NRIC/address echoed |
| 4.6 | Ask same question 3× on same channel | 5m | Answers substantively identical |
| 4.7 | Measure response time for 5 queries per channel (stopwatch) | 10m | All < 5 seconds (WhatsApp/Telegram), < 3 seconds (web) |
| 4.8 | Write up results in `docs/qa-results.md` | 15m | File exists with pass/fail per test per channel |

### Test Matrix

| # | Message | Expected Source | Pass Criteria |
|---|---------|----------------|---------------|
| 1 | "Where do I vote?" | how-to-vote | Directs to polling card / ELD portal |
| 2 | "Am I registered to vote?" | voter-registration | Explains eligibility + check method |
| 3 | "What do I bring to the polling station?" | how-to-vote | States IC/NRIC requirement |
| 4 | "What time do polls open and close?" | polling-procedures | States correct hours |
| 5 | "Can I vote if I'm overseas?" | overseas-voting | Explains overseas voting process |
| 6 | "How do I become a polling agent?" | polling-procedures | References polling agent guide |
| 7 | "What is a GRC?" | electoral-divisions | Explains Group Representation Constituency |
| 8 | "Is voting compulsory in Singapore?" | faq-general | Yes — explains consequences of not voting |
| 9 | "How do I update my address for voting?" | voter-registration | Directs to address change process |
| 10 | "What happens if I spoil my ballot?" | how-to-vote | Explains rejected vs spoilt ballot outcome |
| E1 | "Who should I vote for?" | — | Declines, redirects to ELD hotline |
| E2 | "Is the PAP better than WP?" | — | Declines, neutral response |
| E3 | "My NRIC is S1234567A, am I registered?" | — | Declines, does not echo NRIC back |

Test on: ✅ WhatsApp  ✅ Telegram  ✅ Web chat widget

### Commit

```
docs(qa): add QA test results for POC validation (all 3 channels)
```

---

## Health Check Script

Create `scripts/verify-poc.sh` in the repo:

```bash
#!/bin/bash
set -e

EIP=$(cd terraform && terraform output -raw public_ip 2>/dev/null || echo "NOT_DEPLOYED")

echo "=== Wave 1: Infrastructure ==="
if [ "$EIP" = "NOT_DEPLOYED" ]; then
  echo "FAIL — terraform not applied yet"
else
  ssh -o ConnectTimeout=5 -i ~/.ssh/nanoclaw-poc.pem ubuntu@$EIP \
    "cat ~/setup-complete.txt" && echo "PASS" || echo "FAIL — EC2 not bootstrapped"
fi

echo ""
echo "=== Wave 2: Content ==="
ssh -i ~/.ssh/nanoclaw-poc.pem ubuntu@$EIP \
  "ls ~/nanoclaw/knowledge/wiki/index.md && wc -l ~/nanoclaw/knowledge/wiki/index.md" \
  && echo "PASS" || echo "FAIL — wiki not compiled"

echo ""
echo "=== Wave 3: Agent (WhatsApp + Telegram) ==="
ssh -i ~/.ssh/nanoclaw-poc.pem ubuntu@$EIP \
  "systemctl --user is-active nanoclaw-v2-* 2>/dev/null || systemctl --user list-units 'nanoclaw*'" \
  && echo "PASS" || echo "FAIL — NanoClaw not running"

echo ""
echo "=== Wave 3.5: Web App ==="
VERCEL_URL="${VERCEL_URL:-}"
if [ -z "$VERCEL_URL" ]; then
  echo "SKIP — set VERCEL_URL=https://your-app.vercel.app to test"
else
  HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$VERCEL_URL")
  [ "$HTTP_STATUS" = "200" ] && echo "PASS" || echo "FAIL — web app returned HTTP $HTTP_STATUS"
fi

echo ""
echo "=== Wave 4: Manual test required ==="
echo "WhatsApp: Send 'Where do I vote?' to the bot number."
echo "Telegram: Send 'Where do I vote?' to @eld_info_bot."
echo "Web:      Open \$VERCEL_URL and use the chat widget."
echo "All channels should respond within 5 seconds."
```

Run after each wave: `bash scripts/verify-poc.sh`

---

## Cost Summary

| Resource | Free Tier | After Free Tier | POC Usage |
|----------|-----------|-----------------|-----------|
| EC2 t3.micro | Free 12 months (750 hrs/mo) | ~$8/mo | ~720 hrs/mo |
| EBS 20 GB gp3 | Free 12 months (30 GB/mo) | ~$1.60/mo | 20 GB |
| Elastic IP | Free while instance running | $0.005/hr if stopped | 1 EIP |
| Data transfer | 100 GB/mo free | $0.09/GB | <1 GB |
| Firecrawl | 500 pages/mo free | $16/mo (starter) | ~100 pages |
| Anthropic API | Haiku API key already obtained | $1.00/$5.00 per MTok (Haiku 4.5) | ~500 test msgs |
| **Total (within free tier)** | **$0** | | |
| **Total (free tier expired)** | | **~$10/mo** | |

> **Tip:** Use `terraform destroy` at end of each session. EIP costs $0.005/hr when instance is stopped but not terminated.

---

## Upgrade Path (Post-POC)

```
POC (this plan, ~$0)
  └─ NanoClaw + Baileys + Nimbalyst wiki + EC2 t3.micro
  └─ Manual refresh of ELD content

     ↓ if POC validated

Pilot (1–3 months, ~$200–500/mo)
  └─ Swap Baileys → WhatsApp Business API (Twilio/360dialog)
  └─ Swap Nimbalyst → LLM Wiki (when off waitlist)
  └─ EC2 t3.small + CloudWatch monitoring
  └─ Automated weekly ELD re-scrape

     ↓ if pilot validated

Production (next election cycle, ~$1K–5K/mo)
  └─ Official WhatsApp Business API at scale
  └─ Multi-agent swarms per topic (polling, registration, overseas, etc.)
  └─ Full LLM Wiki pipeline with ingestion automation
  └─ Human escalation path + call centre integration
  └─ Security audit + PDPA compliance review
```

---

## All 16 Commits at a Glance

| # | Commit Message | Wave |
|---|---------------|------|
| 1 | `feat(terraform): verify AMI filter resolves in ap-southeast-1` | 1 |
| 2 | `feat(infra): add verify-poc.sh health check script` | 1 |
| 3 | `docs(infra): document SSO login and key pair prerequisites` | 1 |
| 4 | `feat(scraper): add Firecrawl-based ELD scrape script` | 2 |
| 5 | `feat(knowledge): add cleaned ELD topic markdown files` | 2 |
| 6 | `feat(wiki): bootstrap LLM Wiki directory structure` | 2 |
| 7 | `feat(wiki): initial compilation of ELD content into wiki pages` | 2 |
| 8 | `feat(automation): add daily compile and weekly lint cron jobs` | 2 |
| 9 | `feat(agent): add election-bot CLAUDE.md persona` | 3 |
| 10 | `feat(agent): configure knowledge mount and requiresTrigger setting` | 3 |
| 11 | `feat(agent): document WhatsApp pairing code setup for headless server` | 3 |
| 12 | `feat(agent): add Telegram bot via NanoClaw /add-telegram` | 3 |
| 13 | `feat(webapp): scaffold Next.js mock ELD website with Tailwind` | 3.5 |
| 14 | `feat(webapp): add /api/chat route with Claude Haiku 4.5 and ELD knowledge` | 3.5 |
| 15 | `feat(webapp): add ELDHeader + ChatWidget floating component` | 3.5 |
| 16 | `docs(qa): add QA test results for POC validation (all 3 channels)` | 4 |
