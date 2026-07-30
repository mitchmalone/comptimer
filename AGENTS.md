# AGENTS.md

This file is read at the start of every session. Keep it lean and behavioural. **`STACK.md` is the source of truth for stack decisions and rationale; this file is the operating rules.** When they appear to conflict, follow `STACK.md` and flag it. `CLAUDE.md` is a symlink to this file.

---

## Start here — every session

1. **Orient.** Read `docs/STATUS.md` and anything in `docs/plans/active/` before doing anything else.
2. **Plan before non-trivial work.** Copy `docs/plans/_TEMPLATE.md` into `docs/plans/active/<slug>.md` and fill it in _before_ writing code. Trivial fixes don't need a plan.
3. **Work the plan.** Red/green TDD for anything in `packages/*`: failing test first, then the code.
4. **Close out — in the same PR as the code:** update `docs/STATUS.md`, append a dated entry to `docs/JOURNAL.md`, move the plan to `done/`, and record any decision made along the way in `docs/DECISIONS.md`.

> The docs are fast feedback; **PR review is the gate.** A task is not done until the docs reflect it.

---

## Invariants — non-negotiable

1. **`packages/timer-core` is pure.** No I/O, no network, no direct `Date.now()` — time is injected. Every behaviour is unit-tested. If you're tempted to import anything with a side effect, you're in the wrong package.
2. **Sync state transitions, never ticks.** The network carries commands and session state (`startedAt`, phase plan, pause offsets). Each surface renders the countdown from its own clock. Nothing that runs every second may touch the network.
3. **The phone is the authority; the display is a renderer.** All commands originate from mobile. `apps/web` holds no session logic beyond rendering state and counting locally.
4. **Every cross-surface payload is a Zod schema in `packages/contracts`.** Types are inferred, never hand-written twice. No unvalidated message crosses a process boundary.
5. **Transitions carry server timestamps.** Clients estimate their clock offset once and render against corrected time. Never trust a device clock raw.
6. **The display must survive disconnection.** On transport loss: keep counting locally, show a subtle connection indicator, rehydrate from the sessions row on reconnect. Reliability is the product.
7. **Transport is an implementation detail.** All realtime access goes through the transport interface in `packages/contracts` consumers — no direct `supabase-js` channel calls scattered through app code.
8. **No secrets in the repo.** Admin password and keys live in Vercel/Supabase env. This repo is open source.

---

## How to build things here

- **One PR = one complete block of value.** Never split into incremental PRs that don't individually deliver value ("contracts first, UI later").
- New capability = contract first (Zod schema), then pure logic with tests, then wiring, then UI.
- Prefer boring code. This is a timer, not a framework showcase.

## Commands

```sh
pnpm install        # bootstrap workspace
pnpm dev            # run apps locally
pnpm test           # pnpm -r test (Vitest, colocated *.test.ts)
pnpm typecheck      # tsc -b across the workspace
pnpm lint           # ESLint (max-warnings 0) + Prettier check
```

## Commits & PRs

- **Conventional Commits**, enforced by commitlint via lefthook: `feat(timer-core): add phase skip`. Types: feat, fix, chore, docs, refactor, test, perf, build, ci, style, revert.
- Branches: `main` plus `feature/<short-kebab-slug>`.
- Rebase + squash on latest `origin/main` before every push to a PR; push with `--force-with-lease`.
- Hooks are fast feedback, CI is the gate. Don't bypass with `--no-verify`.

## Definition of done

1. `pnpm typecheck` passes.
2. ESLint + Prettier clean.
3. `pnpm test` green, with unit tests for new logic in `packages/*`.
4. No invariant above violated.
5. Docs updated in the same PR (STATUS, JOURNAL, DECISIONS, plan moved to done).

---

## Don't

- Don't put timing logic in an app — it goes in `packages/timer-core`.
- Don't send ticks over the network.
- Don't call `supabase-js` directly from feature code — go through the transport layer.
- Don't hand-write a type that a Zod schema could infer.
- Don't add auth, payments, or new presets without checking `docs/ROADMAP.md` — they're sequenced deliberately.
- Don't commit secrets, ever.
