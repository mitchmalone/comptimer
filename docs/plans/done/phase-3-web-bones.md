---
title: Phase 3 — Web app bones
status: active
created: 2026-07-30
updated: 2026-07-30
links: [docs/ROADMAP.md, STACK.md]
---

# Task

## Goal

app.comptimer.com counts down a real 5-on/5-off bouldering session in demo mode, driven by a fully TDD'd `timer-core` state machine. (Phase 2 — marketing — is blocked on `/design-login`; phases 2 and 3 are independent, so 3 goes first.)

## Context

The heart of the product. Everything here is pure logic + local rendering: no Supabase, no pairing (Phase 4). The state model must already match the sync design in STACK.md §3 — anchor timestamps + local derivation — so Phase 4 only adds transport, not a rewrite.

## Approach

Red/green TDD in `timer-core` first: types, transitions, derivation. Then Zod mirrors in `contracts` (contracts depends on timer-core for types; timer-core stays zero-dep). Then the display app consumes it with an injected clock.

**State model:** `TimerState = { plan, status, phaseIndex, phaseAnchorMs, pausedRemainingMs }`. Transitions (`start`, `pause`, `resume`, `skip`, `reset`) are pure `(state, nowMs) → state`. `derive(state, nowMs)` walks forward from the anchor consuming phase durations — so a display that was frozen for 12s rolls over phases correctly on the next frame. Count up vs down is a display concern (`direction` on the plan).

## Steps

- [ ] `timer-core`: `Phase`/`PhasePlan`/`TimerState` types; `makeIntervalPlan` builder (work/rest/cycles, labels, `dropLastRest`) + `fiveOnFiveOff` preset
- [ ] `timer-core`: transitions `createTimer`/`start`/`pause`/`resume`/`skip`/`reset` — test-first
- [ ] `timer-core`: `derive(state, now)` — remaining/elapsed, phase rollover, multi-phase gap rollover, finished; `formatClock(ms)`
- [ ] `contracts`: Zod schemas mirroring timer-core types (`satisfies z.ZodType<...>` for drift protection) + `SessionState`
- [ ] `apps/web`: full-screen timer view — huge mm:ss, phase label (CLIMB/REST), cycle indicator, work/rest colour switch, demo Start/Pause/Reset controls (temporary until Phase 4)
- [ ] `apps/web`: pairing screen scaffold behind `#pair` — display code + QR placeholder (real QR + channel in Phase 4)
- [ ] Deploy web to production (prebuilt, `cd` into `apps/web` in the same command)

## Acceptance criteria

- [ ] `pnpm test` green; timer-core covers: countdown, pause/resume freeze, skip, reset, boundary rollover, offline-gap rollover, finish, count-up, plan builder shapes
- [ ] app.comptimer.com shows a 5-on/5-off demo session counting down
- [ ] Docs close-out in the same PR (STATUS, JOURNAL, DECISIONS, plan → done)

## Out of scope

Supabase/pairing/transport (Phase 4), sound (Phase 5), sponsor logos (Phase 5), mobile controls (Phase 4/6), `adjust` transition (Phase 6).

## Risks / open questions

- Exact bouldering timing conventions vary (4-min vs 5-min boulders); `makeIntervalPlan` stays fully parameterised so presets are data, not logic.
