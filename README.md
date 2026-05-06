# melody-intel

**Audrey Evans's $10M-in-3-Years Recon & Dispatch System**

Mission lock: Get to **$10,000,000** by **May 6, 2029**, across the
MIDNGHTSAPPHIRE / Freedom Angel Corps portfolio.

This repo is the brain of Agent Melody. It runs a daily scan, scores findings
against the $10M arc, and fans actionable work out to Linear, Slack, Gmail,
your build agent, and Airtable.

---

## 🧠 ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1 — SCAN  (07:00 MT daily, GitHub Actions cron) │
│  Melody Instigator (Opus) runs .routines/melody-       │
│  instigator.md, web-searches 8 domains, scores findings,│
│  commits data/landscapes/{date}.json + actionable.json │
└─────────────────────────────────────────────────────────┘
                          ↓ git push triggers ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 2 — SYNTHESIZE  (push to data/landscapes/**)    │
│  Synthesizer (Opus) runs .routines/synthesize-and-     │
│  dispatch.md. Reads actionable.json, opens Linear      │
│  issues, posts Slack canvas, drafts Gmail, hits build- │
│  agent webhook (dry-run), updates Airtable, opens PR   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 3 — TEAM EXECUTION                               │
│   • Audrey reviews Linear + recon PR                    │
│   • Build agent (OpenClaw / Claude Code / Cursor /      │
│     Devin) executes against approved branches           │
│   • Caresse picks up caresse-route tickets              │
│   • Airtable shows live $10M dashboard                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 BOOTSTRAP (one-time setup)

### 1. Repo creation

```bash
gh repo create midnghtsapphire/melody-intel --private --source=. --remote=origin --push
```

### 2. Required GitHub secrets

Add these at `https://github.com/midnghtsapphire/melody-intel/settings/secrets/actions`:

| Secret | Source | Required |
|--------|--------|----------|
| `ANTHROPIC_API_KEY` | console.anthropic.com | ✅ |
| `BUILD_AGENT_WEBHOOK_URL` | Build-agent intake endpoint (GrowlingEyes server) | ⚠️ for build dispatch |
| `MELODY_SHARED_SECRET` | Random 32+ char token shared between melody-intel + intake handler | ⚠️ for build dispatch |
| `AIRTABLE_BASE_ID` | Airtable base for `Melody Findings` | ⚠️ for dashboard |
| `SLACK_CHANNEL_ID` | `#melody-recon` channel ID | ⚠️ for Slack alerts |

### 3. MCP connectors (claude.ai or Claude Code)

The synthesis workflow calls these MCP servers — make sure they're connected
on Audrey's account:

- ✅ Linear (already connected per memory)
- ✅ Slack (already connected)
- ✅ Gmail (already connected — read/draft only is fine)
- ✅ Airtable (already connected)

### 4. Airtable base

Create a base named **Melody Command Center** with one table:

**`Melody Findings`** schema:
- `finding_id` (Single line text, primary key)
- `title` (Single line text)
- `venture` (Single select: growlingeyes, neurooz, fidelity, openclaw, cross)
- `domain` (Single select: gov_contracting, enterprise_sec, neurodiv, cle, tooling, capital, distribution, regulatory)
- `composite_score` (Number, 1 decimal)
- `ten_m_velocity` (Number, integer)
- `status` (Single select: new, in_progress, shipped, dropped)
- `owner` (Single select: audrey, build_agent, caresse, hire_external)
- `linear_issue_url` (URL)
- `first_seen` (Date)
- `last_seen` (Date)
- `ten_m_thesis` (Long text)

### 5. Slack channel

Create `#melody-recon` and grab the channel ID (long press → copy link → ID
is the segment after `/archives/`). Add to `SLACK_CHANNEL_ID` secret.

### 6. Linear projects

Make sure these projects exist (or update the synthesizer prompt to match
your naming):
- `growlingeyes`
- `neurooz`
- `fidelity`
- `openclaw`
- `melody-intel`

### 7. Build-agent webhook

On the GrowlingEyes server (164.90.148.7), mount the route:

```
POST /api/build-agent/intake
```

Use the stub at `dispatch/build-agent-intake.ts` — it validates the bearer
token, opens a draft PR in the right venture repo, and hands off to whichever
executor the payload specifies (OpenClaw default; Claude Code / Cursor /
Devin / human as alternates). Default mode is `dry_run` — no auto-merge ever.

You can leave executor handlers stubbed and start with `executor: "human"`
mode if you want zero automation on day one. Audrey reviews the draft PR,
reads the spec, and either takes it herself or assigns it.

### 8. First run

```bash
gh workflow run melody-recon.yml -f reason="bootstrap test"
```

Watch it in the Actions tab. Within ~10 minutes you should see a new
commit on `main` with `data/landscapes/{today}.json` and the synthesis
workflow firing right after.

---

## 🛑 KILL SWITCH

Pause everything:
```bash
touch docs/MELODY_PAUSE
git add docs/MELODY_PAUSE && git commit -m "pause melody" && git push
```

Resume:
```bash
git rm docs/MELODY_PAUSE && git commit -m "resume melody" && git push
```

---

## 📊 KPIs (review monthly)

- Findings discovered → Linear tickets created → PRs shipped (funnel)
- Composite score distribution (avoid score inflation)
- $ value of opportunities surfaced vs. captured
- API spend / month (target < $50)
- False-positive rate (target < 20%)

---

## 🔒 SECURITY NOTES

- This is a **private** repo. Never make it public.
- Never use `pull_request_target` with `allowed_non_write_users='*'`.
  See the hackerbot-claw incident (Feb 2026) for why.
- The build-agent webhook payload validation must verify the
  `MELODY_SHARED_SECRET` bearer token. Rotate it whenever you change executors.

---

## 🗺️ ROADMAP

- [ ] Phase 1: Bootstrap (this PR)
- [ ] Phase 2: Add academic-paper scan (arXiv, bioRxiv) for Neurooz
- [ ] Phase 3: Add SAM.gov RSS direct feed for gov contracting
- [ ] Phase 4: Build `melody.midnghtsapphire.com` dashboard frontend
- [ ] Phase 5: Add weekly retro-loop — Synthesizer reviews last 7 days,
      proposes prompt evolutions per Meta-Evolution Protocol

---

Built by Agent Melody. Mission: $10M by 2029-05-06.
