---
title: Jig reconciliation
status: done
created: 2026-08-12
updated: 2026-08-12
links: ~/Desktop/jig-defects/comptimer.md, github.com/mitchmalone/jig
---

# Task

## Goal

comptimer conforms to the jig standard: one `verify` gate, deltas-only `AGENTS.md`, `STACK.md` dissolved into DECISIONS, `DEVIATIONS.md` recording the real divergences.

## Context

Mitch is normalizing all active projects onto the jig (canonical `AGENTS.md` in the private jig repo; project files carry deltas only). Defects list at `~/Desktop/jig-defects/comptimer.md`; briefing from the jig session confirmed shapes (template/base stubs) and the feed-back protocol (hand learnings to the jig session, single writer).

## Approach

Config first (scripts/hooks/CI so the gate exists), then the docs surgery (AGENTS.md rewrite, STACK.md → DECISIONS, DEVIATIONS.md), then closeout.

## Steps

- [x] Root `package.json`: `verify` = typecheck + lint + format:check + test; `lint` = eslint only; add `format:check`; guard `prepare` for git-less builders (EAS); engines `>=24`.
- [x] `.nvmrc` → 24.
- [x] `lefthook.yml` pre-push → `pnpm verify` (single job).
- [x] `ci.yml` → `pnpm verify` (+ keep `pnpm build`), node 24.
- [x] Rewrite `AGENTS.md` to the template shape: identity → Standard → docs pointer → Stack table → Invariants → Commands (incl. ports) → DoD.
- [x] Migrate STACK.md rationale not already in `docs/DECISIONS.md` into dated entries; delete `STACK.md`.
- [x] Replace `CLAUDE.md` symlink with a one-line `@AGENTS.md` pointer file.
- [x] Create `DEVIATIONS.md`: Expo/EAS mobile (no flavor yet), 4 Vercel projects vs 2, no auth vs Better-Auth-always.
- [x] `pnpm verify` green; docs closeout (STATUS, JOURNAL, plan → done) in the same PR.
- [x] Send feed-back to the jig session: pure timer-core invariant wording + Expo/EAS specifics.

## Acceptance criteria

- [x] `pnpm verify` exists, passes, and is what pre-push and CI run.
- [x] `AGENTS.md` contains no restatement of the jig standard.
- [x] `STACK.md` gone; its rationale lives in DECISIONS.
- [x] `CLAUDE.md` is a regular file containing `@AGENTS.md`.
- [x] `DEVIATIONS.md` exists with justified, triggered entries.

## Out of scope

- Actually consolidating the Vercel projects (recorded as a deviation with a trigger instead).
- Any change to app/package code, EAS profiles, or deploy config.

## Risks / open questions

- engines `>=24`: EAS builder images control their own node; pnpm only warns on engines mismatch (no `engine-strict`). Watch the next EAS build.
- STATUS notes prod (marketing) is ahead of `main` via open PR #6 and a display PR is pending — this branch touches docs both will also touch; small merge conflicts expected.
