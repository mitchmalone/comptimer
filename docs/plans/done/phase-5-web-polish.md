---
title: Phase 5 — Improve the web app
status: done
created: 2026-07-30
updated: 2026-07-30
links: [docs/ROADMAP.md, STACK.md]
---

# Task

## Goal

A display you'd run a real comp night on: audible cues, resilient reconnection, sponsor logo support, and a sharper big-screen presentation.

## Context

Phase 4 proved the spine end to end. The display currently has no sound (unusable for bouldering rotations), refetches state only on mount, and renders no sponsor content. Design-asset import is still blocked on `/design-login` — this phase does a tasteful hand-rolled pass; the imported design lands with Phase 2.

## Approach

Cue _detection_ is pure and lives in `timer-core` (TDD): `detectCues(prevView, nextView) → CueEvent[]` — countdown ticks (last 5s), one-minute warning, phase change (incl. start/skip), finish. The web app maps cues to WebAudio tones (no audio assets). Browser autoplay policy means sound needs one user gesture: a speaker toggle on the display, preference persisted.

## Steps

- [x] `timer-core`: `detectCues` — test-first (tick edges, no double-fire, phase change vs finish precedence, resume ≠ start)
- [x] `contracts`: optional `logos[]` + `organizerLogoUrl` on `SessionState` (backward compatible)
- [x] `apps/web`: WebAudio `SoundEngine` + `useSoundCues` + speaker toggle (default muted until tapped; localStorage)
- [x] `apps/web` display polish: final-5s clock colour shift, thin phase-progress bar, "NEXT: BOULDER n" during rest, sponsor logo strip when present
- [x] `apps/web` resilience: refetch session on reconnect and on tab visibilitychange
- [x] Deploy; verify `#demo` (sound + visuals testable without a phone)

## Acceptance criteria

- [ ] Last-5-seconds beeps, phase-change horn, finish horn audible on `#demo` after enabling sound (needs a human ear — cue logic is unit-tested)
- [x] Display refetches state after a dropped connection returns
- [x] All tests green; docs closed out in the PR

## Out of scope

Design-asset import (Phase 2), logo upload flow (schema + render only), mobile changes (Phase 6), volume/cue configuration UI.

## Risks / open questions

- Exact comp cue conventions vary (IFSC vs local) — cue set kept minimal and data-driven so presets can override later.
