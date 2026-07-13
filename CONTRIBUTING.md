# Contributing to melody-intel

> **Mission lock:** Every contribution to this repo is filtered through one
> question: does this bring us closer to **$10M by May 6, 2029**?

---

## Who can contribute

- **Audrey** — owner and sole decision-maker on live dispatch and revenue actuals.
- **Build agents** (OpenClaw / Claude Code / Cursor / Devin / human) — execute on
  approved branches; never merge their own PRs.
- **Caresse** — stakeholder and sometimes-builder; follows the same process.
- **Agent Melody** — the AI meta-collective (Claude Opus) that runs the daily scan
  and synthesis; it opens PRs but does not self-merge.

---

## Ground rules

1. **Private repo only.** Never make it public. Never open a PR to a public fork.
2. **Kill switch first.** Before any commit that touches workflows, check whether
   `docs/MELODY_PAUSE` exists. If it does, stop and ask Audrey.
3. **No live dispatch without Audrey approval.** Build-agent dispatch payload defaults
   to `dry_run: true`. Switching to live mode requires an explicit instruction in
   the PR description or a direct message from Audrey.
4. **$10M filter.** Composite score ≥ 6.5 is the real bar. If a finding or change
   can't justify that, leave it out.
5. **No retroactive data edits.** `data/landscapes/{date}.json` files are append-only.
   Never modify a file dated in the past; add a new file instead.
6. **No revenue numbers without Audrey.** Only Audrey updates actuals in
   `docs/ten_m_dashboard.md`. Agents may read the dashboard but must never invent
   or extrapolate revenue figures.

---

## Branch and PR conventions

| Type | Branch prefix | Commit prefix |
|------|--------------|---------------|
| Recon or scan changes | `recon/` | `recon:` |
| Dispatch or synthesizer changes | `dispatch/` | `dispatch:` |
| Workflow / CI changes | `ci/` | `ci:` |
| Docs | `docs/` | `docs:` |
| Chores (deps, housekeeping) | `chore/` | `chore:` |
| Fixes | `fix/` | `fix:` |

- Open PRs as **draft** until they are ready for Audrey's review.
- PR title must start with the commit-prefix type (e.g. `ci: add CodeQL workflow`).
- Never self-merge. Audrey merges all PRs.

---

## Code review jury

Every PR (once out of draft) is reviewed by the full jury:

| Reviewer | What it checks |
|----------|---------------|
| **OpenRouter AI review** (`ai-pr-review-openrouter.yml`) | Logic, clarity, risk |
| **Jules** (`jules-pr-reviewer.yml`) | Design and correctness |
| **Semgrep** (`semgrep.yml`) | SAST — secrets, OWASP top 10, CWE top 25 |
| **CodeQL** (`codeql.yml`) | Static analysis of JS/TS and workflow YAML |

All four must pass (or be explicitly bypassed with a label) before merge.

---

## Secrets

If you are setting up a fresh fork or clone, add these repository secrets:

| Secret | Where to get it | Required |
|--------|----------------|----------|
| `ANTHROPIC_API_KEY` | console.anthropic.com | ✅ |
| `OPENROUTER_API_KEY` | openrouter.ai | ✅ for AI PR review |
| `JULES_API_KEY` | jules.google.com | ✅ for Jules review |
| `ADMIN_GITHUB_TOKEN` | GitHub PAT with `repo` scope | ✅ for PR/issue automation |
| `BUILD_AGENT_WEBHOOK_URL` | GrowlingEyes server endpoint | ⚠️ build dispatch |
| `MELODY_SHARED_SECRET` | Random 32+ char token | ⚠️ build dispatch |
| `AIRTABLE_BASE_ID` | Airtable base for Melody Findings | ⚠️ dashboard |
| `SLACK_CHANNEL_ID` | `#melody-recon` channel ID | ⚠️ Slack alerts |

---

## Dependency updates

Dependencies are minimal (no `package.json` or `Gemfile` in the root). To update
the `anthropics/claude-code-action` version used in the recon/synthesize workflows,
open a `chore:` PR with the new tag and a link to the upstream release notes.

---

## Testing

There are currently no automated unit tests. Before opening a PR that touches
`.routines/melody-instigator.md` or `.routines/synthesize-and-dispatch.md`, run
a manual `workflow_dispatch` on `melody-recon.yml` with `reason: "test run"` and
confirm that a valid `data/landscapes/{date}.json` is committed.

---

## Questions

Open an issue or reach out to Audrey directly. The kill switch
(`docs/MELODY_PAUSE`) is always available if something goes sideways.
