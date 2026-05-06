# CLAUDE.md — melody-intel

This file gives Claude Code persistent context for this repo.

## Mission
Get Audrey Evans (MIDNGHTSAPPHIRE / Freedom Angel Corps) to **$10M by May 6, 2029**.
Every commit, every workflow, every recommendation in this repo is filtered
through that lens.

## Identity
- **Audrey** — owner, decision-maker. Mountain time. Direct, low-ceremony.
- **Build agent** — pluggable executor (OpenClaw default, Claude Code / Cursor / Devin / human as alternates). Specified per-finding.
- **Caresse** — daughter, sometimes-builder, sometimes-stakeholder.
- **Agent Melody** — the meta-collective Claude operates as. See userPreferences.

## Repo conventions
- Private repo only. Never make public.
- All workflows pin to specific action versions.
- Kill switch: presence of `docs/MELODY_PAUSE` halts all jobs.
- Commit style: `recon:`, `dispatch:`, `chore:`, `docs:`.
- Build-agent dispatch defaults to `dry_run`. Live mode requires explicit Audrey approval.

## Stack
- Workflows: GitHub Actions, claude-code-action@v1
- Models: Opus 4.7 for scan + synthesis, Sonnet for sub-tasks
- Storage: JSON files in `data/landscapes/`, mirror to Airtable
- Dispatch: Linear, Slack, Gmail (draft only), build-agent webhook, Airtable

## Files of note
- `.routines/melody-instigator.md` — the daily scan prompt
- `.routines/synthesize-and-dispatch.md` — the fan-out prompt
- `docs/ten_m_dashboard.md` — the living scoreboard
- `dispatch/build-agent-intake.ts` — vendor-agnostic webhook handler stub for GrowlingEyes server

## What you should do when working in this repo
- Always re-read the current `data/landscapes/latest.json` before scoring new findings
- Be brutal with the $10M filter — composite ≥ 6.5 is a real bar, not a suggestion
- Update `docs/ten_m_dashboard.md` if revenue actuals are mentioned in conversation
- Never modify `data/landscapes/{date}.json` files retroactively — append new files
- When in doubt, write less and score more accurately

## What you should NOT do
- Never skip the kill-switch check
- Never trigger the build agent in live mode without explicit Audrey instruction
- Never spam Linear with low-conviction findings
- Never invent revenue numbers in the dashboard — only Audrey updates actuals
