/**
 * Build Agent Intake — receives dispatch payloads from Melody Synthesizer.
 *
 * Vendor-agnostic. The `executor` field on the payload determines who
 * actually does the work. Add new executors by extending the EXECUTORS map.
 *
 * Mount on the GrowlingEyes Express app at /api/build-agent/intake.
 *
 * Required env:
 *   MELODY_SHARED_SECRET   — bearer token Melody Synthesizer sends
 *   GITHUB_APP_TOKEN       — token with write access to MIDNGHTSAPPHIRE org
 *
 * Optional executor-specific env (only set what you use):
 *   CLAUDE_CODE_API_KEY
 *   OPENCLAW_BASE_URL
 *   CURSOR_BACKGROUND_AGENT_KEY
 *   DEVIN_API_KEY
 */

import type { Request, Response } from 'express';
import { z } from 'zod';

const ExecutorSchema = z.enum([
  'openclaw',     // Audrey's self-hosted agent — preferred default
  'claude-code',  // Anthropic Claude Code via API
  'cursor',       // Cursor background agent
  'devin',        // Cognition Devin
  'human',        // Audrey or Caresse, no automation
]);

const DispatchPayloadSchema = z.object({
  source: z.literal('melody-instigator'),
  finding_id: z.string().uuid(),
  venture: z.enum(['growlingeyes', 'neurooz', 'fidelity', 'openclaw', 'cross']),
  executor: ExecutorSchema.default('openclaw'),
  spec: z.string().min(50).max(5000),
  mode: z.enum(['dry_run', 'live']).default('dry_run'),
  rollback_branch: z.string().regex(/^melody\//),
  approval_required: z.boolean().default(true),
  ten_m_thesis: z.string().min(20),
});

type DispatchPayload = z.infer<typeof DispatchPayloadSchema>;
type Executor = z.infer<typeof ExecutorSchema>;

const VENTURE_REPOS: Record<DispatchPayload['venture'], string> = {
  growlingeyes: 'midnghtsapphire/growlingeyes',
  neurooz: 'midnghtsapphire/neurooz',
  fidelity: 'midnghtsapphire/fidelity-trust-services',
  openclaw: 'midnghtsapphire/openclaw',
  cross: 'midnghtsapphire/melody-intel',
};

// Executor dispatch table — each handler receives the payload and PR url.
const EXECUTORS: Record<Executor, (p: DispatchPayload, prUrl: string) => Promise<void>> = {
  openclaw: dispatchToOpenClaw,
  'claude-code': dispatchToClaudeCode,
  cursor: dispatchToCursor,
  devin: dispatchToDevin,
  human: async () => { /* no-op — human will see the PR and act manually */ },
};

export async function buildAgentIntakeHandler(req: Request, res: Response) {
  // 1. Auth
  const authHeader = req.headers.authorization ?? '';
  if (authHeader !== `Bearer ${process.env.MELODY_SHARED_SECRET}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  // 2. Validate
  const parsed = DispatchPayloadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_payload', details: parsed.error.flatten() });
  }
  const payload = parsed.data;

  // 3. Live mode requires explicit approval
  if (payload.mode === 'live' && payload.approval_required) {
    return res.status(403).json({
      error: 'live_mode_requires_explicit_approval',
      hint: 'Set the build-execute-live label on the Linear issue first',
    });
  }

  // 4. Open the draft PR (executor-agnostic)
  const targetRepo = VENTURE_REPOS[payload.venture];
  if (!targetRepo) return res.status(400).json({ error: 'unknown_venture' });

  try {
    const { prUrl } = await createDraftPR({
      repo: targetRepo,
      branchName: payload.rollback_branch,
      title: `[MELODY ${payload.executor.toUpperCase()} ${payload.mode.toUpperCase()}] ${payload.spec.slice(0, 60)}…`,
      body: buildPRBody(payload),
    });

    // 5. Hand off to the chosen executor (only if dry_run is acceptable for it)
    const handler = EXECUTORS[payload.executor];
    if (handler) {
      await handler(payload, prUrl);
    }

    return res.status(200).json({
      ok: true,
      finding_id: payload.finding_id,
      executor: payload.executor,
      pr_url: prUrl,
      mode: payload.mode,
    });
  } catch (err) {
    console.error('[build-agent-intake] error', err);
    return res.status(500).json({ error: 'dispatch_failed' });
  }
}

// ---------------------------------------------------------------------------
// PR body builder (executor-agnostic)
// ---------------------------------------------------------------------------

function buildPRBody(payload: DispatchPayload): string {
  return `# Melody-dispatched build spec

**Executor:** \`${payload.executor}\`
**Mode:** \`${payload.mode}\`
**Finding ID:** \`${payload.finding_id}\`
**Venture:** \`${payload.venture}\`
**Approval required:** ${payload.approval_required ? 'YES — human must approve before merge' : 'no'}

## $10M Thesis
${payload.ten_m_thesis}

## Spec
${payload.spec}

---

> 🤖 Opened by Melody Synthesizer. Audrey: review, then merge or close.
> No build executor auto-merges in this org.
`;
}

// ---------------------------------------------------------------------------
// Executor handlers — fill these in based on what you actually use
// ---------------------------------------------------------------------------

async function dispatchToOpenClaw(payload: DispatchPayload, prUrl: string): Promise<void> {
  if (!process.env.OPENCLAW_BASE_URL) return;
  await fetch(`${process.env.OPENCLAW_BASE_URL}/agent/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENCLAW_API_KEY}`,
    },
    body: JSON.stringify({
      source: 'melody',
      finding_id: payload.finding_id,
      pr_url: prUrl,
      spec: payload.spec,
      mode: payload.mode,
    }),
  });
}

async function dispatchToClaudeCode(payload: DispatchPayload, prUrl: string): Promise<void> {
  // Claude Code Action runs on GitHub Actions itself — typically you'd post
  // a comment on the PR with @claude and the spec, or push a CLAUDE.md
  // workflow that triggers on PR open. Stub here for your wiring.
  console.log('[claude-code] dispatched', payload.finding_id, prUrl);
}

async function dispatchToCursor(payload: DispatchPayload, prUrl: string): Promise<void> {
  // Cursor background agents accept a job spec via API.
  console.log('[cursor] dispatched', payload.finding_id, prUrl);
}

async function dispatchToDevin(payload: DispatchPayload, prUrl: string): Promise<void> {
  // Devin API: create session with spec.
  console.log('[devin] dispatched', payload.finding_id, prUrl);
}

// ---------------------------------------------------------------------------
// GitHub PR creation (Octokit — wire to your existing integration)
// ---------------------------------------------------------------------------

async function createDraftPR(opts: {
  repo: string;
  branchName: string;
  title: string;
  body: string;
}): Promise<{ prUrl: string }> {
  // TODO: implement with Octokit:
  //  1. Get default branch SHA
  //  2. Create new branch from it
  //  3. Add SPEC.md file with opts.body contents
  //  4. Open a draft PR titled opts.title
  throw new Error('implement createDraftPR with Octokit');
}
