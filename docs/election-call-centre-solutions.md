# Election Call Centre Consistency: Solution Analysis

## The Problem

During elections, call centre staff face **hundreds of thousands of inquiries** (Elections Ontario handles 10M+ electors; NYC BoE processes 20,000+ calls per general election). Most questions are repetitive — "Where's my polling station?", "How do I get a postal vote?", "Am I registered?" — but agents give inconsistent, sometimes incorrect answers under pressure. Staff are often temporary/seasonal, making training harder.

---

## 6 Solution Approaches (Ranked by Feasibility)

---

### 1. Centralised Knowledge Base + Scripted Responses

**What it is:** A single, searchable source of truth agents pull answers from. Pre-approved response templates for the top 50-100 questions. Agents copy/paste or read from scripts.

**Real-world precedent:**
- Elections Ontario issued an RFI specifically for a "Centralized Knowledge-Based Solution" (2020)
- Elections Canada modernised with a centralised CMS replacing "redundant legacy applications and knowledge bases"
- UK Electoral Commission uses Civica Xpress (70% of English/Welsh local authorities) — web-based agent portal with real-time electoral register lookup

**Products:** KMS Lighthouse ($15K-$50K/yr), Guru ($300-$1,500/mo), Shelf.io ($400-$2,000/mo), or even Confluence/Notion for simpler setups

**Cost:** $5K-$50K/year depending on scale

**Timeline:** 2-6 weeks to deploy

| Pros | Cons |
|------|------|
| Cheapest option; fastest to deploy | Agents still need to search and interpret |
| Easy to update in real-time (e.g. polling station closures) | Doesn't prevent agents going off-script |
| No AI risk/hallucination concerns | Doesn't handle phone calls — text/email only |
| Low training overhead | Quality depends entirely on content maintenance |
| Works with any existing phone system | Doesn't scale for surge periods |

**Change management:** Low. Agents learn one new tool. Main risk: content goes stale if no one owns updates.

**Feasibility: ★★★★★** — Should be the baseline regardless of other solutions chosen.

---

### 2. AI Agent Assist (Real-Time Copilot for Staff)

**What it is:** AI listens to the live call/chat, understands the question, and suggests the correct answer to the agent in real-time. Agent reviews and delivers it. Human stays in the loop.

**Real-world precedent:**
- **UK Government's Caddy** (built by i.AI/DSIT for Citizens Advice): Agents with Caddy were **2x more likely to report confidence** and **1.5x more likely to resolve issues**. 80% of AI responses were high enough quality to pass directly to advisors. Rolled out to 6 offices.
- **YoungWilliams** (US government services): Built "Priya" on Azure AI — response time dropped from **4 minutes to 3 seconds**. Handles child support, SNAP, and EBT inquiries.
- Google CCAI Agent Assist claims **28% more conversations handled** per agent, **15% faster response times**.

**Products:**

| Product | Cost | Timeline |
|---------|------|----------|
| Google CCAI Agent Assist | $0.002-$0.05/interaction | 4-8 weeks |
| Microsoft Copilot Studio | $0.01/credit (~$20-100K/yr) | 2-4 weeks |
| NICE CXone RTIG | $71-$249/agent/month + $21K-$155K implementation | 8-16 weeks |
| Five9 Agent Assist | Bundled ($850-$1,700/agent/mo) | 8-12 weeks |
| Cisco Webex AI Assistant | Contact sales | 4-8 weeks |

**Cost:** $20K-$400K/year depending on agent count and platform

**Timeline:** 4-16 weeks

| Pros | Cons |
|------|------|
| **Best approach for consistency** — every agent gets same suggested answer | Requires good knowledge base as input (garbage in = garbage out) |
| Human stays in loop — mitigates AI hallucination risk | Higher cost than pure knowledge base |
| Dramatically reduces training time for temp staff | Integration with existing phone/CRM systems needed |
| Measurable: can track suggestion acceptance rate | Some agents may resist ("Big Brother" perception) |
| Works for both phone and chat channels | Needs stable internet infrastructure |

**Change management:** Medium. Staff need to trust AI suggestions without blindly copying them. The Caddy model (human-in-the-loop with supervisor validation) is the gold standard for government adoption. Pilot with volunteers first — CMS built a **waitlist** which created organic demand.

**Feasibility: ★★★★☆** — Best balance of quality, cost, and risk. Recommended primary solution.

---

### 3. IVR + Voice Bot (Automated Phone Self-Service)

**What it is:** Callers interact with an automated system that answers common questions directly — "Say or press 1 for polling station location" — with natural language understanding. Only complex queries reach a human.

**Real-world precedent:**
- NYC Board of Elections uses **Genesys PureConnect** with IVR across 2 independent sites, handling multilingual self-service 24/7
- NZ Electoral Commission outsources 0800 information services with requirement for rapid scaling for unplanned events (by-elections)
- Accenture's federal Intelligent Service Center model: AI-powered virtual agents handle **85% of specific calls**

**Products:**

| Product | Cost | Timeline |
|---------|------|----------|
| Amazon Lex + Twilio | $0.004/speech request + $0.0045/min | 2-4 weeks |
| Dialogflow CX | Custom pricing | 4-8 weeks |
| Five9 IVA | Bundled with platform | 8-12 weeks |
| Intelekt AI (voice) | $30K-$200K/yr | 8-12 weeks |

**Cost:** $10K-$300K/year

**Timeline:** 2-12 weeks

| Pros | Cons |
|------|------|
| Deflects 20-40% of calls — massive cost saving | Citizens often hate automated phone systems |
| 24/7 availability (no staffing needed) | Complex questions still need humans |
| Perfectly consistent — same answer every time | Setup requires mapping all FAQ intents |
| Scales infinitely during surge periods | Accessibility concerns (elderly, hearing-impaired, non-native speakers) |
| Pay-per-use pricing works well for seasonal election spikes | Wrong answers damage public trust more than slow human answers |

**Change management:** Low for staff (reduces their workload). High for citizens — public resistance to "press 1" systems is well-documented. Mitigate with natural language ("just say what you need") and instant human escalation option.

**Feasibility: ★★★☆☆** — Good for deflecting simple volume, but cannot be the sole solution. Use as a front-door filter.

---

### 4. Citizen-Facing Chatbot (Web/WhatsApp/SMS)

**What it is:** Public-facing AI chatbot on the election website, WhatsApp, or SMS that answers voter questions directly without human involvement.

**Real-world precedent:**
- **Madhya Pradesh, India**: WhatsApp chatbot served **5.5M voters** with **1.2M interactions** in one election cycle. 95% officer response rate within 15 minutes.
- **Montgomery County, Maryland**: "Monty 2.0" ChatGPT-powered bot covers 3,000+ topics in 100+ languages, including "Where do I vote?"
- **GOV.UK Smart Answers**: Flow-based Q&A system — guides citizens through complex decisions with branching questions leading to a definitive outcome
- **Canada Digital Service (ai-answers)**: Government AI assistant with human expert evaluation system, model-independent architecture, single citations to official sources
- **TextMyGov**: Deployed across multiple US counties — keyword SMS ("text ELECTIONS HELP" for instant answers), 24/7, bilingual

**Products:**

| Product | Cost | Timeline |
|---------|------|----------|
| Microsoft Copilot Studio | $0.01/credit | 1-4 weeks |
| Amazon Lex | $0.00075/text request | 2-6 weeks |
| Dialogflow CX | Custom | 4-8 weeks |
| IBM watsonx | $1,110+/mo | 4-8 weeks |
| WhatsApp Business API (via Gupshup, Twilio) | $0.005-$0.05/message | 2-4 weeks |

**Cost:** $5K-$150K/year

**Timeline:** 1-8 weeks

| Pros | Cons |
|------|------|
| Scales to millions of queries at negligible marginal cost | AI hallucination risk — incorrect voting info is dangerous |
| 24/7, multilingual, instant | Requires rigorous content governance and testing |
| Dramatically reduces call volume (Alameda County: **81% email reduction**) | Not everyone uses web/WhatsApp (elderly, rural) |
| Citizens increasingly prefer self-service | Legal liability if bot gives wrong info about voting rights |
| Easy to update content in real-time | Still need human fallback for edge cases |

**Change management:** Low for staff. Medium for public trust — **must** clearly label as AI, provide instant human escalation, and have rigorous QA. The Canada Digital Service model (human expert evaluation + single official source citation) is the safety gold standard.

**Feasibility: ★★★★☆** — Excellent for volume deflection. Must pair with human escalation and rigorous content QA.

---

### 5. Full Contact Centre Platform Replacement

**What it is:** Replace the entire phone/email/chat infrastructure with a modern CCaaS (Contact Centre as a Service) that includes knowledge base, IVR, agent assist, analytics, and workforce management in one platform.

**Real-world precedent:**
- Elections Ontario issued RFP for "Internal Contact Centre Solution" (SaaS, including design, integration, testing, training, support)
- Elections Canada's EC3 project: "replace and modernize aging systems... redesign, centralize and standardize the client journey"
- NYC Board of Elections migrating from Genesys PureConnect to Genesys Cloud (2025)
- AEC's Indigo Program: $96.7M to replace 93 legacy systems over 7 years

**Products:** Genesys Cloud, NICE CXone, Five9, Amazon Connect, Twilio Flex

**Cost:** $100K-$2M+/year (depending on agent count and features)

**Timeline:** 3-18 months

| Pros | Cons |
|------|------|
| Solves everything in one platform | Extremely expensive and slow to deploy |
| Unified analytics — see all channels in one dashboard | Government procurement cycles add 6-12 months |
| Workforce management handles seasonal staffing | Massive change management burden |
| Future-proof — vendor handles upgrades | Vendor lock-in risk |
| Compliance built-in (FedRAMP, SOC2) | Overkill if existing phone system works |

**Change management:** Very high. Full platform replacement means retraining every agent, migrating data, and managing political risk if rollout goes wrong during an election. AEC's program is budgeted at $96.7M over 7 years — this is not a quick fix.

**Feasibility: ★★☆☆☆** — Right long-term answer, wrong short-term solution. Never do this right before an election.

---

### 6. Enhanced Training + Quality Assurance (Non-Tech)

**What it is:** Instead of technology, invest in better training materials, call scripts, quality monitoring, and supervisor coaching. Record calls, score them, give feedback.

**Real-world precedent:**
- NZ Electoral Commission's RFI emphasised "politically neutral, culturally appropriate" delivery with quality monitoring
- Elections Canada's MCCS contract includes call recording + screen capture specifically for "training and quality assurance"
- UK Electoral Commission outsources to Echo Managed Services with structured training + surge capacity model

**Cost:** $10K-$100K (training development, QA software, supervisors)

**Timeline:** 2-8 weeks

| Pros | Cons |
|------|------|
| No technology risk | Doesn't scale — each new temp hire needs full training |
| Agents maintain autonomy and morale | Quality degrades under pressure (elections = pressure) |
| Works with zero infrastructure changes | Inconsistency is inherent in human delivery |
| Cheapest option | Supervisors become bottleneck |
| Politically safest (no "AI answering voter questions" headlines) | Can't handle 24/7 or sudden volume spikes |

**Change management:** Low. But effectiveness is also low — this is what most election bodies already do, and it's the reason the problem persists.

**Feasibility: ★★★★★ (to deploy) / ★★☆☆☆ (to actually solve the problem)**

---

## Recommended Strategy: Layered Approach

Don't pick one. Layer them:

```
┌─────────────────────────────────────────────────┐
│  LAYER 1: Citizen Self-Service (deflect volume)  │
│  Chatbot + IVR + FAQ website                     │
│  Target: 30-40% call deflection                  │
│  Cost: $10K-$50K  │  Timeline: 2-6 weeks         │
├─────────────────────────────────────────────────┤
│  LAYER 2: Agent Assist (ensure consistency)      │
│  AI copilot + centralised knowledge base         │
│  Target: 100% answer consistency for agents      │
│  Cost: $20K-$100K  │  Timeline: 4-8 weeks        │
├─────────────────────────────────────────────────┤
│  LAYER 3: QA & Training (maintain quality)       │
│  Call recording, scoring, supervisor coaching     │
│  Target: Catch remaining inconsistencies         │
│  Cost: $10K-$50K  │  Timeline: 2-4 weeks         │
└─────────────────────────────────────────────────┘

Total estimated cost: $40K-$200K
Total timeline: 6-12 weeks (parallel deployment)
Expected outcome: 30-40% fewer calls + consistent answers on remaining calls
```

**Phase sequencing for elections specifically:**

1. **6+ months before election:** Deploy knowledge base + chatbot. Test and refine content.
2. **3 months before:** Add agent assist. Train permanent staff. Run pilot with 10% of agents.
3. **1 month before:** Scale agent assist to all agents. Deploy IVR. Onboard temp staff (with AI assist, training time drops from weeks to days).
4. **Election period:** Monitor, update content in real-time (polling station changes, emergency info), scale infrastructure.
5. **Post-election:** Analyse data. Build business case for next cycle.

---

## Detailed Cost Comparison

| Solution | Year 1 Cost | Ongoing/Year | Implementation Time | Consistency Impact |
|----------|-------------|--------------|--------------------|--------------------|
| Knowledge Base only | $5K-$50K | $5K-$20K | 2-6 weeks | Medium |
| AI Agent Assist | $20K-$400K | $20K-$200K | 4-16 weeks | **High** |
| IVR + Voice Bot | $10K-$300K | $10K-$100K | 2-12 weeks | High (automated portion) |
| Citizen Chatbot | $5K-$150K | $5K-$50K | 1-8 weeks | High (automated portion) |
| Full Platform Replace | $200K-$2M+ | $100K-$500K | 3-18 months | High |
| Training + QA only | $10K-$100K | $10K-$50K | 2-8 weeks | Low-Medium |
| **Layered (recommended)** | **$40K-$200K** | **$35K-$150K** | **6-12 weeks** | **Very High** |

---

## Key Risk: Election-Specific Considerations

| Risk | Mitigation |
|------|------------|
| **AI gives wrong voting info** — legal/democratic consequences | Human-in-the-loop mandatory. Chatbot cites official sources only. Escalation path always available. |
| **System goes down on election day** | Redundant sites (NYC BoE model: 2 independent sites). Paper fallback scripts for agents. |
| **Political neutrality** | All content reviewed by non-partisan team. AI trained on factual info only, not policy positions. NZ model: "politically neutral and culturally appropriate." |
| **Accessibility** | IVR + chatbot must meet WCAG 2.0 / Section 508. Telephone interpreter service for non-English speakers. NRS for deaf/hearing-impaired (UK Electoral Commission model). |
| **Data privacy** | Elections Canada conducts formal PIAs (Privacy Impact Assessments) for contact centre services. Follow this model. |

---

## Change Management Summary

| Approach | Staff Impact | Citizen Impact | Political Risk | Training Needed |
|----------|-------------|---------------|----------------|-----------------|
| Knowledge Base | Low (learn 1 tool) | None | None | 1-2 hours |
| Agent Assist | Medium ("Big Brother" fears) | None (invisible to caller) | Low | 4-8 hours + ongoing |
| IVR/Voice Bot | Low (fewer calls) | High (citizen frustration) | Medium | Minimal |
| Chatbot | Low (fewer calls) | Medium (trust in AI) | Medium-High | Minimal |
| Platform Replace | Very High (everything changes) | Medium | High | 2-4 weeks |
| Training + QA | Low | None | None | 1-2 weeks |

**Government-specific change management lessons (from real deployments):**

1. **Build a waitlist, not a mandate** (CMS approach) — voluntary adoption creates evangelists
2. **Pilot with 1-2 teams first** — never agency-wide "big bang" during election cycle
3. **Measure before and after** — establish baselines (cost/call, FCR, agent satisfaction) before deployment
4. **Frame as augmentation** — "AI helps you do your job better" not "AI replaces you"
5. **Involve agents in testing early** — they spot problems faster than managers
6. **Budget 20-30% extra for training/change management** — technology is only 70% of the cost
7. **Expect 40-60% longer timelines than private sector** — compliance, procurement, approvals

---

---

## Supplementary Tool Research: LLM Wiki + NanoClaw

### LLM Wiki (llm-wiki.app)

**What it is:** An AI-powered knowledge management platform that **compiles** documents into a persistent, interlinked wiki — not traditional RAG (retrieval-augmented generation). Based on Andrej Karpathy's "LLM Wiki" pattern.

**How it works:**
1. **Ingest** — Upload documents (PDFs, transcripts, articles, call recordings). The LLM reads each source, extracts key info, and files it into structured markdown wiki pages.
2. **Compile** — Every new source touches 10-15 pages, strengthening a knowledge graph. Entity pages, concept pages, summaries, and cross-references are auto-generated.
3. **Query** — Ask questions against the compiled wiki. Answers come with `[[wikilink]]` citations.
4. **Lint** — Detects contradictions, orphans, stale content, and gaps automatically.

**Key differentiator vs. traditional RAG:**

| | Traditional RAG | LLM Wiki |
|---|---|---|
| Knowledge processing | At query time | At ingest time |
| Memory | Session-only | Persistent wiki |
| Contradictions | Rarely caught | Flagged at ingest |
| Cost over time | Linear (same cost/query) | Decreasing (amortized compiles) |
| Output | Ephemeral chat response | Persistent wiki + graph |

**Relevance to election call centres:**
- Feed call transcripts, policy documents, and voter FAQ updates → auto-builds a living knowledge base
- Contradiction detection catches when policy changes conflict with older content
- Agents query a compiled, consistent wiki rather than searching scattered docs
- Knowledge compounds — each election cycle builds on the previous

**Status:** Currently on waitlist. No public pricing yet.

---

### NanoClaw (nanoclaws.io / github.com/qwibitai/nanoclaw)

**What it is:** A lightweight, open-source personal AI agent framework built on the Anthropic Claude Agent SDK. ~500 lines of TypeScript. Agents run in isolated Linux containers with messaging platform integrations.

**Key features:**
- **Multi-channel:** WhatsApp (built-in), Telegram, Discord, Slack, Microsoft Teams, iMessage, Signal, Google Chat, Webex, Matrix, WeChat, email — installed on demand via `/add-` skills
- **Container isolation:** Each agent runs in its own Docker container (or Apple Container on macOS). True OS-level filesystem isolation.
- **Agent Swarms:** Multiple Claude agents collaborate on complex tasks in parallel
- **Persistent memory:** SQLite + per-group `CLAUDE.md` files
- **Scheduled tasks:** Cron jobs that trigger agents proactively
- **Web access + browser automation:** Chromium sandboxed inside containers
- **Security:** Credentials never enter containers — injected at HTTPS layer via OneCLI Agent Vault
- **~500 lines, ~15 source files** — fully auditable in ~8 minutes

**Architecture:**

| Component | Detail |
|-----------|--------|
| Host process | Node.js 22 + pnpm |
| Agent containers | Bun 1.3+ running TypeScript |
| Message model | Inbox/outbox via SQLite (`inbound.db` / `outbound.db`) |
| Default provider | Anthropic Claude Agent SDK |
| Alternative providers | OpenAI Codex (`/add-codex`), OpenRouter/Google/DeepSeek (`/add-opencode`), Ollama (`/add-ollama-provider`) |
| Isolation | Docker (Linux/macOS/WSL2) or Apple Container (macOS) |

**Relevance to election call centres:**
- Deploy AI agents on WhatsApp/Telegram for citizen self-service — channels where voters already are
- Agent swarms handle routing: one specialist agent per topic (polling stations, registration, postal votes, ID requirements)
- Container isolation = security-first (critical for government deployment)
- Open source = fully auditable (common government procurement requirement)
- Scheduled tasks = proactive outreach (voter registration deadline reminders, election day alerts)
- Docker Sandboxes partnership = enterprise-grade MicroVM isolation

**Cost:** Free (MIT license). Ongoing cost is Anthropic API usage only (~$3-15/1M tokens depending on model).

**Backing:** Created by Gavriel Cohen (NanoCo). Featured on Docker's official blog (March 2026). Active Docker partnership for Sandbox integration.

---

### Combined Architecture: LLM Wiki + NanoClaw for Election Call Centres

These two tools can form the backbone of a low-cost, open-source, citizen-facing + agent-assist solution:

```
Citizen (WhatsApp / Telegram / SMS)
              │
              ▼
  ┌───────────────────────────┐
  │     NanoClaw Agent Swarm   │
  │  ┌────────┐  ┌──────────┐  │
  │  │Polling │  │Registrat.│  │
  │  │Station │  │& Eligib. │  │
  │  └────────┘  └──────────┘  │
  │  ┌────────┐  ┌──────────┐  │
  │  │Postal  │  │Election  │  │
  │  │Voting  │  │Day Rules │  │
  │  └────────┘  └──────────┘  │
  │           │                 │
  │           ▼                 │
  │   LLM Wiki (knowledge)      │
  │   - Election policies        │
  │   - Polling station data     │
  │   - Registration rules       │
  │   - Historical Q&A pairs     │
  │   - Contradiction-checked    │
  └───────────────────────────┘
              │
              ▼ (escalation)
       Human Agent (with same
       LLM Wiki for consistency)
```

**Pros of this combination:**

| | Detail |
|---|---|
| Cost | API usage only — no per-seat licensing |
| Auditability | Fully open source, ~500 lines to audit |
| Channels | WhatsApp + Telegram + Teams etc. — where voters already are |
| Knowledge | Auto-maintained wiki with contradiction checks |
| Security | OS-level container isolation |
| Scalability | Agent swarms handle concurrent conversations |

**Cons and risks:**

| | Detail |
|---|---|
| LLM Wiki maturity | Waitlist/early-stage — not yet production-proven at scale |
| Single-provider dependency | NanoClaw is Claude/Anthropic-only by default |
| Project age | Both are 2026 projects — limited enterprise SLAs or support |
| Integration work | Needs custom connectors for electoral register databases and polling station lookups |
| Compliance gaps | No established FedRAMP/SOC2 certifications yet |

**Best suited for:** Smaller election bodies or pilot programmes wanting low-cost, auditable, WhatsApp-native citizen self-service — particularly in markets with high WhatsApp adoption (Southeast Asia, South Asia, Africa, Latin America). Not recommended as a sole solution for large-scale national elections without a proven production track record.

---

## Sources & References

**Government Procurement Documents:**
- Elections Ontario RFI: "Support Automation and Centralized Knowledge-Based Solution" (EO-020920-2, 2020)
- Elections Ontario RFP: "Internal Contact Centre Solution" (EO-071524)
- Elections Canada: "Contact Centers Project (EC3)" — RFI for CMS modernisation
- NZ Electoral Commission: ROI for "0800 Information Services" (GETS, 2023)
- Elections Canada: Privacy Impact Assessment for Managed Contact Centre Services (2023)

**Case Studies & Deployments:**
- UK Government AI Hub: Caddy (i.AI/DSIT + Citizens Advice) — ai.gov.uk
- NYC Board of Elections Contact Centre (DiRAD Systems, 2022)
- AEC Indigo Program (iTnews, 2022) — $96.7M modernisation
- Madhya Pradesh WhatsApp chatbot (Gupshup case study, 2024)
- Montgomery County "Monty 2.0" (MD Gov press release, 2024)
- YoungWilliams + Azure AI Foundry (Microsoft Customer Story, 2025)
- Canada Digital Service "ai-answers" (GitHub: cds-snc/ai-answers)
- GOV.UK Smart Answers (GitHub: alphagov/smart-answers)
- FCC + Zendesk (85% cost savings vs on-premise)
- Accenture Federal Intelligent Service Center (2026)

**Technology Pricing:**
- Google CCAI Agent Assist pricing page (cloud.google.com)
- NICE CXone tiers (government procurement data)
- Amazon Lex pricing (pay-as-you-go)
- Microsoft Copilot Studio credit model
- Five9 AI Agent Assist (five9.com)

**Industry Analysis:**
- Accenture: "The Intelligent Service Center" — 40% OpEx reduction model (2026)
- Scottish Government FOI: Contact Centre, CRM and AI systems disclosure (2024)
- Democracy Club: Electoral Commission API case study (2023)

---

## NanoClaw WhatsApp: Citizen Experience

### The key question: do citizens need to install anything?

**No. Zero installation required from the public.**

The entire setup burden sits on the election commission's side. Once deployed, citizens interact with the bot exactly like messaging any WhatsApp contact.

### How it works from each perspective

**Election Commission (operator) — one-time setup:**
1. Provision a server (cloud VM, or even a Raspberry Pi)
2. Run `bash nanoclaw.sh` — auto-installs all dependencies
3. Obtain a dedicated WhatsApp number for the election bot
4. Link it via QR scan or pairing code (identical to setting up WhatsApp Web)
5. Configure the agent's knowledge base and response scope
6. Publish the WhatsApp number on the website, polling card, posters

**Member of public — zero setup:**
1. Open WhatsApp (already on their phone)
2. Message the election commission's WhatsApp number
3. Ask in plain language: *"Where is my polling station?"*
4. Receive an instant reply

The experience is indistinguishable from messaging a person.

### Important caveat — Baileys vs. Official WhatsApp Business API

NanoClaw uses **Baileys**, which piggybacks on the WhatsApp Web protocol. This is **not** the official WhatsApp Business API.

| | Baileys (NanoClaw default) | WhatsApp Business API (official) |
|---|---|---|
| Cost | Free | ~$0.005–$0.09/conversation |
| Setup | Link any phone number you own | Apply via Meta, approval required |
| Scale | Limited — one Web session per number, rate limits apply | Built for millions of messages |
| Reliability | Can disconnect; suitable for lower volumes | Enterprise SLA, 99.9% uptime |
| Terms of Service | Grey area — not officially supported by Meta | Fully Meta-compliant |
| Broadcast | Not supported | Supported |

**For a national election commission handling millions of citizen queries, Baileys alone is not production-ready.** The correct path for scale is to use NanoClaw's agent + Claude AI logic but swap the WhatsApp transport for the official **WhatsApp Business API** (via Twilio, 360dialog, or Meta directly). NanoClaw's modular architecture supports this swap.

**For a POC or pilot with limited volume, Baileys works fine.**

---

## Zero-Budget POC: NanoClaw + LLM Wiki

### Objective

Demonstrate that an AI agent can answer common election questions via WhatsApp consistently and accurately — using only free/open-source tools and free-tier API credits.

### What you need (all free)

| Item | Source | Cost |
|------|--------|------|
| NanoClaw | github.com/qwibitai/nanoclaw | Free (MIT) |
| Anthropic API key | console.anthropic.com | Free tier: $5 credit on signup |
| LLM Wiki | llm-wiki.app | Waitlisted — use alternative below |
| LLM Wiki alternative | Nimbalyst or local markdown wiki | Free |
| Server / machine | Your laptop, a spare PC, or Raspberry Pi | $0 (use what you have) |
| WhatsApp number | Any phone number linked to WhatsApp | $0 (use a spare SIM or existing number) |
| Docker | docker.com | Free |

> **LLM Wiki waitlist workaround:** LLM Wiki is currently waitlisted. For the POC, use the **Nimbalyst LLM Wiki pattern** (free, runs locally) or simply maintain a folder of markdown files that NanoClaw's Claude agent reads as its knowledge base. The architecture is identical — swap in LLM Wiki when access is granted.

---

### POC Architecture

```
Voter (their existing WhatsApp)
           │  messages election WhatsApp number
           ▼
┌─────────────────────────────────┐
│         NanoClaw                │
│  (running on your laptop/server)│
│                                 │
│  Receives message               │
│  → Sends to Claude Agent SDK    │
│  → Claude reads knowledge base  │
│  → Returns answer               │
│  → Sends reply via WhatsApp     │
└─────────────────────────────────┘
           │  reads from
           ▼
┌─────────────────────────────────┐
│     Knowledge Base (markdown)   │
│  /knowledge/                    │
│    polling-stations.md          │
│    registration.md              │
│    postal-vote.md               │
│    election-day-rules.md        │
│    faq.md                       │
└─────────────────────────────────┘
```

---

### Step-by-Step POC Setup

#### Step 1 — Prerequisites (15 minutes)

```bash
# Ensure you have:
# - Node.js 20+
# - Docker Desktop (mac/windows) or Docker Engine (linux)
# - Claude Code CLI
# - Git

# Install Claude Code if not installed
npm install -g @anthropic-ai/claude-code

# Verify Docker is running
docker ps
```

Get your free Anthropic API key at **console.anthropic.com** → create account → API Keys → Create Key.

---

#### Step 2 — Clone and install NanoClaw (10 minutes)

```bash
# Clone the repo
git clone https://github.com/qwibitai/nanoclaw.git
cd nanoclaw

# Run the automated installer
bash nanoclaw.sh
```

The installer will:
- Install Node, pnpm, Docker if missing
- Register your Anthropic API key
- Build the agent container
- Prompt you to pair a WhatsApp channel

---

#### Step 3 — Add WhatsApp channel (5 minutes)

Inside the Claude Code prompt (after running `claude` in the project directory):

```
/add-whatsapp
```

The skill will:
1. Detect your environment (desktop or headless server)
2. Show a QR code — scan it with WhatsApp on your phone (same as WhatsApp Web)
3. Link your number as the bot's WhatsApp identity

> **Tip:** Use a spare SIM or secondary number for the bot. If you only have one phone, use the pairing code method — enter your number, get a code, type it into WhatsApp → Linked Devices → Link a Device.

---

#### Step 4 — Build your election knowledge base (30–60 minutes)

Create a `/knowledge` folder in the project with markdown files. These become the agent's source of truth.

**Example: `knowledge/faq.md`**

```markdown
# Election FAQ

## Where is my polling station?
Polling stations are assigned based on your registered address.
Voters can look up their polling station at [official website] or
by calling the election hotline at [number].

## How do I register to vote?
Registration closes 14 days before election day. Register online
at [website] or in person at your local electoral office.
Citizens must be 18+ and hold valid ID.

## How do I apply for a postal vote?
Apply at [website] at least 7 days before election day.
You will need your IC number and registered address.

## What ID do I need to bring?
Bring your National Identity Card (IC). Expired ICs are accepted.
No other ID is valid at polling stations.

## What time do polling stations open?
Polling stations are open from 8:00 AM to 5:00 PM on election day.

## I am overseas. Can I still vote?
Overseas voting is available for registered overseas electors.
Register at [website] and select your preferred overseas voting centre.
```

Repeat for each topic area. Keep each file focused on one subject. The more specific and accurate the content, the more consistent the agent's answers will be.

---

#### Step 5 — Configure the agent's system prompt (10 minutes)

Edit `CLAUDE.md` in the project root (or the relevant group's `CLAUDE.md`) to give the agent its persona and constraints:

```markdown
# Election Information Agent

You are an official election information assistant for [Election Commission Name].
Your role is to help members of the public with factual questions about the
upcoming election.

## Your knowledge base
Read files in /knowledge/ to answer questions. Always ground your answers
in these files. Do not speculate or guess.

## Rules
- Answer only election-related questions
- If you don't know the answer, say: "I'm not sure about that. Please call
  our hotline at [number] or visit [website] for accurate information."
- Never express political opinions or favour any party or candidate
- Keep answers concise — 2-4 sentences maximum
- Always offer to help with another question at the end
- If a question involves a specific address or IC number, direct the user
  to the official website or hotline — do not ask for personal data

## Tone
Friendly, helpful, neutral, and professional. Plain language only.
```

---

#### Step 6 — Register the WhatsApp chat (5 minutes)

In your Claude Code session, register which WhatsApp chat(s) the agent should respond to. For a public-facing bot, register incoming DMs from any number:

```
/manage-channels
```

Follow the prompts to set the agent to respond to direct messages. Set `requiresTrigger: false` for DMs (so citizens don't need to type `@Andy` — they just message naturally).

---

#### Step 7 — Test it (15 minutes)

From a **different** phone (not the one linked to the bot), message the bot's WhatsApp number with test questions:

```
"Where is my polling station?"
"What time do polls close?"
"How do I apply for a postal vote?"
"Who should I vote for?" ← should be politely declined
"My IC number is 123456" ← should not be stored or echoed back
```

Verify:
- Answers are accurate and grounded in your knowledge files
- Out-of-scope questions are declined gracefully
- No personal data is repeated back
- Tone is consistent and neutral

---

#### Step 8 — Integrate LLM Wiki (when access granted)

When LLM Wiki access is available, replace the manual markdown maintenance with the LLM Wiki pipeline:

1. Upload your existing election documents (policy PDFs, official guides, past FAQ call logs)
2. LLM Wiki compiles them into interlinked wiki pages
3. Point NanoClaw's knowledge base path at the LLM Wiki output folder
4. On each policy update, ingest the new document → wiki auto-updates
5. Run lint weekly to catch contradictions (e.g. two documents with different registration deadlines)

**In the meantime (LLM Wiki waitlist workaround):** Use the Nimbalyst `/wiki` pattern — paste one prompt into a Claude Code session and it builds the same compounding wiki locally with daily compilation and weekly health checks. See: nimbalyst.com/use-cases/knowledge-base

---

### POC Success Criteria

Before presenting to stakeholders, verify all of the following:

| Test | Pass Criteria |
|------|--------------|
| Accuracy | Answers match source documents exactly |
| Consistency | Same question asked 3x gives same answer |
| Graceful decline | Political/out-of-scope questions declined politely |
| Escalation | "I don't know" cases direct to hotline/website |
| Privacy | No personal data stored or echoed |
| Tone | Neutral, clear, no political bias |
| Availability | Bot responds within 5 seconds |
| Multilingual (optional) | Test in local language if applicable |

---

### POC Cost Breakdown

| Item | Cost |
|------|------|
| NanoClaw | $0 |
| Docker | $0 |
| Anthropic API (POC volume ~500 test messages) | ~$0.50–$2.00 from free credit |
| Server (your laptop during POC) | $0 |
| WhatsApp number | $0 (use existing) |
| LLM Wiki | $0 (waitlist) |
| **Total** | **~$0** |

> Free Anthropic credit ($5) is sufficient for thousands of test messages at POC scale. Claude Haiku (fastest, cheapest model) costs ~$0.00025 per message exchange — $5 buys ~20,000 exchanges.

---

### Limitations to Acknowledge in POC

| Limitation | Mitigation for production |
|-----------|--------------------------|
| Baileys WhatsApp (not official API) | Swap to WhatsApp Business API via Twilio or 360dialog |
| Single phone number, rate limits | Official API supports unlimited concurrent conversations |
| Knowledge base is manually maintained | LLM Wiki automates compilation and contradiction checks |
| No analytics dashboard | Add logging; use Anthropic's usage dashboard for volume metrics |
| Claude API dependency | Ongoing cost at scale (~$0.00025–$0.002/message depending on model) |
| No formal security audit | Required before public launch |

---

### Upgrade Path (post-POC)

```
POC (now, $0)
  └─ NanoClaw + Baileys + manual markdown KB
  └─ Single WhatsApp number, low volume
  └─ Your laptop or $5/mo VPS

     ↓ if POC succeeds

Pilot (1–3 months, ~$200–$500/mo)
  └─ NanoClaw + WhatsApp Business API (Twilio/360dialog)
  └─ LLM Wiki for automated knowledge management
  └─ Dedicated VPS or small cloud VM
  └─ Basic logging and monitoring

     ↓ if pilot succeeds

Production (election cycle, ~$1K–$5K/mo depending on volume)
  └─ Official WhatsApp Business API at scale
  └─ Multi-agent swarms per topic area
  └─ Full LLM Wiki pipeline with policy ingestion
  └─ Human escalation path integrated
  └─ Security audit + compliance review
```

---

## Cloud Hosting + ELD.gov.sg Scraping for POC

### Q1: Can NanoClaw be hosted on a cloud server instead of a laptop?

**Yes. NanoClaw is fully designed for remote Linux server deployment.**

From the official docs and community PRs, NanoClaw explicitly supports DigitalOcean, AWS EC2, GCP, Hetzner, Vultr, Linode, and Oracle Cloud. The headless server path (no screen/display) is a first-class supported mode.

#### Minimum server requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| OS | Ubuntu 22.04+ / Debian 12+ | Ubuntu 24.04 LTS |
| CPU | 1 vCPU | 2 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 10 GB | 20 GB |
| Architecture | x86_64 or ARM64 | Either |

#### Free/zero-cost cloud options for POC

| Provider | Free Tier | Specs | Notes |
|----------|-----------|-------|-------|
| **Oracle Cloud Free Tier** | Always free | 4 ARM64 vCPU, 24 GB RAM (Ampere A1) | Best free option — generous, no time limit |
| **Google Cloud** | $300 credit (90 days) | e2-micro always free after trial | 1 vCPU, 1 GB RAM — minimum viable |
| **AWS** | 12 months free | t2.micro / t3.micro | 1 vCPU, 1 GB RAM |
| **Hetzner Cloud** | €20 trial credit | CX11: 1 vCPU, 2 GB RAM | ~€3.29/mo after trial — cheapest paid option |
| **Fly.io** | Generous free tier | Shared CPU, 256MB–1GB RAM | Good for lightweight bots |

> **Recommendation for POC:** Oracle Cloud Free Tier (Ampere A1) — 4 ARM64 cores and 24 GB RAM, always free, no credit card expiry, and NanoClaw explicitly supports ARM64.

#### How cloud deployment differs from laptop

The only difference from laptop setup is **WhatsApp authentication**. On a headless server (no screen), you cannot scan a QR code. Use the **pairing code method** instead:

```bash
# During /add-whatsapp setup, choose "pairing code"
# Enter your phone number → receive a numeric code
# On your phone: WhatsApp → Linked Devices → Link a Device → enter code
# No camera or screen needed on the server
```

Everything else is identical. NanoClaw installs a **systemd service** that:
- Starts automatically on server boot
- Restarts on failure
- Survives SSH logout (`loginctl enable-linger` is set automatically)
- Logs to `journalctl --user -u nanoclaw-v2-*`

#### Cloud setup steps (after provisioning your server)

```bash
# 1. SSH into your server
ssh ubuntu@<your-server-ip>

# 2. Install build prerequisites (not handled by installer)
sudo apt update && sudo apt install -y gcc python3 make

# 3. Install Docker Engine
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# 4. Clone and run NanoClaw installer
git clone https://github.com/qwibitai/nanoclaw.git
cd nanoclaw
bash nanoclaw.sh

# 5. When prompted for WhatsApp auth method → choose "pairing code"
# 6. Service auto-starts and survives reboots
```

#### Verifying it stays alive after SSH logout

```bash
# Enable linger (installer does this, but verify)
loginctl enable-linger $USER

# Check service is running
systemctl --user status nanoclaw-v2-*

# Watch live logs
journalctl --user -u nanoclaw-v2-* -f
```

---

### Q2: Can AI scrape www.eld.gov.sg — all pages, documents, and PDFs?

**Yes. Fully doable.** ELD's website is public, static, and well-structured. Here is what is available and how to scrape it.

#### What's on eld.gov.sg

From direct inspection of the site, the following content is publicly available:

| Content Type | Examples | Format |
|---|---|---|
| Voter guides | "How to Vote" brochure (GE2025) | PDF |
| Agent guides | Guide for Polling Agents GE2025, Guide for Counting Agents GE2025 | PDF |
| Candidate handbooks | GE2025, GE2020, GE2015 (going back to 2011) | PDF |
| Media releases | GE2025 Writ of Election, results announcements | PDF |
| Legislative documents | Presidential Elections Act 1991 (revised 2021) | PDF |
| Candidate forms | Nomination Paper, Election Agent forms, donation certificates | PDF |
| Advisory documents | Cybersecurity advisory, PDPA advisory, online campaigning rules | PDF |
| FAQ pages | Voter registration, polling procedures, overseas voting | HTML |
| Historical records | Process improvements, 70th anniversary content | HTML + PDF |
| Electoral division info | GRC/SMC lists, electoral boundaries | HTML |

#### Scraping approach — three options

**Option A: NanoClaw's built-in browser automation (simplest, zero extra cost)**

NanoClaw already ships Chromium inside its agent containers with browser automation. You can instruct the agent to crawl ELD.gov.sg:

```
@Andy crawl https://www.eld.gov.sg, visit every page,
download all PDFs, and save the text content of each page
to /knowledge/eld/. Organise by section.
```

The agent will use its built-in web browsing tools to navigate, extract text, follow links, and download PDFs. This is the **zero-additional-cost** path — no extra tools needed.

**Option B: Firecrawl (recommended for completeness and clean output)**

[Firecrawl](https://firecrawl.dev) is purpose-built for scraping entire sites into clean markdown — exactly what LLM Wiki and NanoClaw's knowledge base need.

```bash
# Install
npm install -g firecrawl-cli

# Crawl the entire ELD site → clean markdown files
firecrawl crawl https://www.eld.gov.sg \
  --output ./knowledge/eld \
  --format markdown \
  --include-pdfs \
  --max-depth 5
```

- **Free tier:** 500 pages/month — sufficient for ELD's full site
- **Output:** Clean markdown per page, PDFs extracted to text
- **PDF handling:** Automatically extracts text from PDFs
- **Result:** A `/knowledge/eld/` folder of markdown files ready to feed into NanoClaw or LLM Wiki

**Option C: Custom Python scraper (most control)**

For full control over what gets scraped and how PDFs are processed:

```python
# Required: pip install requests beautifulsoup4 pypdf2 markdownify

import requests
from bs4 import BeautifulSoup
import pypdf2
from markdownify import markdownify
from urllib.parse import urljoin
import os

BASE_URL = "https://www.eld.gov.sg"
OUTPUT_DIR = "./knowledge/eld"

def scrape_eld():
    visited = set()
    queue = [BASE_URL]
    
    while queue:
        url = queue.pop(0)
        if url in visited:
            continue
        visited.add(url)
        
        response = requests.get(url)
        
        # Handle PDFs
        if url.endswith('.pdf'):
            save_pdf_as_markdown(url, response.content)
            continue
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Save page as markdown
        content = soup.find('main') or soup.find('body')
        md = markdownify(str(content))
        save_markdown(url, md)
        
        # Queue internal links
        for link in soup.find_all('a', href=True):
            full_url = urljoin(BASE_URL, link['href'])
            if BASE_URL in full_url and full_url not in visited:
                queue.append(full_url)

scrape_eld()
```

#### Known ELD PDF URLs to target directly

Based on research, these are confirmed available PDFs:

```
# GE2025 voter and candidate documents
https://www.eld.gov.sg/pdf/GE2025_HowToVote_Brochure_EL.pdf
https://www.eld.gov.sg/pdf/GE2025/13i%20Guide%20for%20Polling%20Agents%20of%20General%20Election%202025.pdf
https://www.eld.gov.sg/press/2025/Media%20Release%20on%20General%20Election%202025.pdf

# Legislative documents
https://www.eld.gov.sg/Resources/Presidential%20Elections%20Act%201991.pdf

# Historical candidate handbooks (going back to 2011)
https://www.eld.gov.sg/pdf/GE2015/Candidate%20Handbook%20for%20Parliamentary%20Election%202015_1.pdf

# Key HTML pages to scrape
https://www.eld.gov.sg/voters.html
https://www.eld.gov.sg/faq.html
https://www.eld.gov.sg/candidate_parliamentary_publication.html
https://www.eld.gov.sg/candidate_parliamentary_forms.html
```

#### Feeding scraped content into the knowledge base

Once scraped, feed into NanoClaw/LLM Wiki:

```
knowledge/
  eld/
    voter-registration.md       ← from /voters.html
    how-to-vote.md              ← from GE2025 brochure PDF
    polling-procedures.md       ← from polling agent guide PDF
    faq-general.md              ← from /faq.html
    electoral-divisions.md      ← from boundary maps pages
    overseas-voting.md          ← from overseas voting pages
    candidate-handbook.md       ← from candidate handbook PDF
    media-releases/
      ge2025-writ.md
      ge2025-results.md
```

Then point the NanoClaw agent's `CLAUDE.md` at this folder. The agent reads these files when answering questions, ensuring all answers are grounded in official ELD content.

#### Important notes on scraping eld.gov.sg

| Consideration | Detail |
|---|---|
| **Robots.txt** | Check `https://www.eld.gov.sg/robots.txt` before scraping — respect any disallow rules |
| **Rate limiting** | Add 1–2 second delays between requests to be respectful to the server |
| **Content freshness** | Re-scrape before each election cycle — content changes (new guides, updated FAQs) |
| **PDF language** | ELD publishes some content in English, Chinese, Malay, and Tamil — scrape all language versions for multilingual support |
| **Copyright** | ELD content is Singapore Government content — permissible for internal use; check if deploying publicly |
| **Dynamic content** | Most ELD pages are static HTML — no JavaScript rendering needed. Chromium-based tools handle the few dynamic pages |

---

### Revised Zero-Budget POC Plan (Cloud + ELD Scraping)

With these two additions, the updated POC architecture looks like:

```
┌──────────────────────────────────────────────┐
│           Oracle Cloud Free Tier              │
│         (ARM64, 4 vCPU, 24GB RAM)            │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │            NanoClaw                     │  │
│  │  (systemd service, auto-restart)        │  │
│  │                                         │  │
│  │  WhatsApp ← citizen messages            │  │
│  │      ↓                                  │  │
│  │  Claude Agent (reads knowledge base)    │  │
│  │      ↓                                  │  │
│  │  /knowledge/eld/ (scraped ELD content)  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │     ELD Scraper (run once + refresh)    │  │
│  │  Firecrawl / NanoClaw browser agent    │  │
│  │  → downloads all ELD pages + PDFs      │  │
│  │  → converts to clean markdown          │  │
│  │  → saves to /knowledge/eld/            │  │
│  └─────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
           ↑ managed via SSH from anywhere
```

**Updated cost breakdown:**

| Item | Cost |
|------|------|
| Oracle Cloud Free Tier server | $0 (always free) |
| NanoClaw | $0 (MIT) |
| Firecrawl scraping (500 pages free) | $0 |
| Anthropic API (~500 test messages) | ~$0.50 from free credit |
| WhatsApp number | $0 (existing SIM) |
| **Total** | **~$0** |

---

## AWS Deployment with Terraform

### Why Terraform

Terraform lets you spin the entire POC environment up and down with two commands — no clicking through the AWS Console, no forgetting to stop the instance, no manual cleanup. The infrastructure is version-controlled alongside the knowledge base.

```bash
terraform apply    # spins everything up (~2 min)
terraform destroy  # tears everything down, stops all billing
```

### Repository structure

```
chatELD/
  terraform/
    main.tf                  # provider + backend config
    variables.tf             # all inputs with descriptions
    ec2.tf                   # security group, EC2, Elastic IP
    outputs.tf               # SSH command, public IP, instance ID
    backend.tf               # optional S3 state (commented out by default)
    userdata.sh.tpl          # bootstrap script: installs Docker, Node, clones NanoClaw
    terraform.tfvars.example # copy → terraform.tfvars, fill in your values
    .gitignore               # excludes tfstate, tfvars, .pem files
```

### Prerequisites

1. **Terraform CLI** — install from [terraform.io](https://developer.hashicorp.com/terraform/downloads)
   ```bash
   # macOS
   brew install terraform

   # Linux
   sudo apt install terraform
   # or use tfenv for version management
   ```

2. **AWS SSO configured** — if not done yet:
   ```bash
   aws configure sso
   # SSO start URL: https://your-org.awsapps.com/start
   # SSO Region: ap-southeast-1
   # Follow the browser login prompt
   # Note the profile name it creates
   ```

3. **EC2 Key Pair** — create once in AWS Console → EC2 → Key Pairs → Create:
   - Name: `nanoclaw-poc`
   - Type: ED25519
   - Download the `.pem` file → save to `~/.ssh/nanoclaw-poc.pem`
   - `chmod 400 ~/.ssh/nanoclaw-poc.pem`

4. **Your public IP:**
   ```bash
   curl ifconfig.me
   # e.g. 123.45.67.89 → use as 123.45.67.89/32 in tfvars
   ```

### First-time setup

```bash
# 1. Copy the example vars file and fill it in
cd terraform/
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars

# 2. Initialise Terraform (downloads AWS provider)
terraform init

# 3. Preview what will be created
terraform plan

# 4. Create everything
terraform apply
# → type "yes" when prompted
# → takes ~2 minutes
# → outputs your SSH command when done
```

**Example output after apply:**
```
Outputs:

instance_id   = "i-0abc123def456"
public_ip     = "18.141.xx.xx"
ssh_command   = "ssh -i ~/.ssh/nanoclaw-poc.pem ubuntu@18.141.xx.xx"
instance_state = "running"
ami_id        = "ami-0xxxxxxxxxxxxxxx"
```

### Complete NanoClaw setup after provisioning

```bash
# 1. SSH in (use the ssh_command output)
ssh -i ~/.ssh/nanoclaw-poc.pem ubuntu@18.141.xx.xx

# 2. Wait ~3 minutes for userdata bootstrap to finish
# Check it's done:
cat ~/setup-complete.txt

# 3. Run NanoClaw setup
cd ~/nanoclaw
bash nanoclaw.sh
# → when prompted for WhatsApp auth: choose "pairing code"
# → enter your SG phone number (+65xxxxxxxx)
# → open WhatsApp on your phone → Linked Devices → Link a Device → enter the code
```

### Day-to-day: start and stop hassle-free

**Stop the instance (pause billing for compute, keep storage):**
```bash
# Via AWS CLI (SSO profile)
aws ec2 stop-instances \
  --instance-ids $(cd terraform && terraform output -raw instance_id) \
  --profile your-sso-profile

# Or via Terraform (stops without destroying)
aws ec2 stop-instances --instance-ids i-0abc123def456 --profile your-sso-profile
```

**Start it again:**
```bash
aws ec2 start-instances \
  --instance-ids i-0abc123def456 \
  --profile your-sso-profile

# Elastic IP ensures the public IP stays the same — WhatsApp pairing intact
```

**Tear down everything (zero billing):**
```bash
cd terraform/
terraform destroy
# → type "yes"
# → removes EC2, security group, Elastic IP
# → all billing stops except S3 (if you enabled remote state)
```

**Recreate from scratch:**
```bash
terraform apply
# → new instance, same IP (Elastic IP is re-associated)
# → re-run NanoClaw setup and re-pair WhatsApp (pairing is stored on the instance)
```

> **Tip:** Stop the instance overnight and on weekends — saves ~70% of compute cost. The Elastic IP keeps the same public address when you restart. WhatsApp session is stored on the EBS volume and survives stop/start.

### SSO token refresh

AWS SSO tokens expire (typically every 8–12 hours). Before running Terraform commands, refresh:

```bash
aws sso login --profile your-sso-profile
# opens browser → approve → token refreshed
# then run terraform apply / destroy normally
```

### Terraform tfvars reference

```hcl
# terraform.tfvars — never commit this file (it's in .gitignore)

aws_profile    = "your-sso-profile-name"   # from `aws configure sso`
aws_region     = "ap-southeast-1"           # Singapore — lowest latency to ELD + SG users
instance_type  = "t3.micro"                 # free tier eligible; t3.small for more RAM
key_pair_name  = "nanoclaw-poc"             # name of key pair in EC2 console
my_ip          = "123.45.67.89/32"          # your public IP — restricts SSH to you only
project_name   = "nanoclaw-poc"             # used as Name tag on all resources
volume_size_gb = 20                         # free tier allows 30 GB max
```

### What Terraform creates

| Resource | Details |
|----------|---------|
| `aws_security_group` | Inbound: SSH (port 22) from your IP only. Outbound: all (for WhatsApp + Claude API). |
| `aws_instance` | Ubuntu 24.04 LTS, t3.micro, 20 GB gp3 EBS (encrypted), userdata bootstraps Docker + Node + NanoClaw |
| `aws_eip` | Static Elastic IP — ensures same address after stop/start so WhatsApp pairing persists |

### Optional: Remote state in S3

If multiple people need to run Terraform, enable shared state. Uncomment the block in `terraform/backend.tf` and fill in your bucket name:

```bash
# Create S3 bucket for state (one-time)
aws s3 mb s3://your-org-tfstate-nanoclaw --region ap-southeast-1 --profile your-sso-profile
aws s3api put-bucket-versioning \
  --bucket your-org-tfstate-nanoclaw \
  --versioning-configuration Status=Enabled \
  --profile your-sso-profile

# Create DynamoDB table for state locking (one-time)
aws dynamodb create-table \
  --table-name tfstate-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1 \
  --profile your-sso-profile

# Then uncomment backend.tf and re-init
terraform init -migrate-state
```

### Cost summary (AWS)

| Resource | Free tier | After free tier |
|----------|-----------|-----------------|
| EC2 t3.micro | Free 12 months (750 hrs/mo) | ~$8/mo |
| EBS 20 GB gp3 | Free 12 months (30 GB/mo) | ~$1.60/mo |
| Elastic IP | Free while instance running | $0.005/hr if instance stopped |
| Data transfer out | 100 GB free/mo | $0.09/GB after |
| **Total (running 24/7)** | **$0 (within free tier)** | **~$10/mo** |
| **Total (stop overnight + weekends ~60% uptime)** | **$0** | **~$4/mo** |
