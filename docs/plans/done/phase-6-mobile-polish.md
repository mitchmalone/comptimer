---
title: Phase 6 — Improve the mobile app
status: done
created: 2026-07-31
updated: 2026-07-31
links: [docs/ROADMAP.md, STACK.md]
---

# Task

## Goal

A controller a judge runs a full comp night on: mid-session time adjustment, competitions (ordered titled sessions, persistent logos), and a control surface with real button feel.

## Context

Phases 4–5 shipped the spine and the display. The phone still can't correct time, run more than one session, or set logos. Constraint: **JS-only changes** — no new native modules, so the existing dev client keeps working over Metro without an EAS rebuild.

## Approach

`adjust(state, deltaMs)` lands in timer-core first (TDD): shifts remaining time in the current phase, clamped to (0, duration]. Competitions are phone-local: an ordered list of `{title, plan}`; advancing publishes a fresh timer under the **same session id**, so the display just renders — it never learns competitions exist. Skeuomorphism via layered RN styles (shadows, highlights, pressed states).

## Steps

- [x] `timer-core`: `adjust` — test-first (running shifts anchor, paused shifts remainder, clamps both ends, idle/finished no-op)
- [x] `apps/mobile` setup: session list (add/remove/reorder-lite), per-session title + plan; organizer + sponsor logo URLs
- [x] `apps/mobile` control: ±30s buttons, next-session advance (same session id, logos persist), skeuomorphic button pass
- [x] Publish on adjust and on session advance; all tests green

## Acceptance criteria

- [x] ±30s from the phone shifts the display immediately, clamped sanely at phase edges
- [x] A two-session competition runs end to end with the title switching and logos persisting
- [x] No new native dependencies (`package.json` diff proves it)

## Out of scope

Design-asset import (Phase 2), logo upload/storage (URLs only), haptics (native — needs a dev-client rebuild, queue for a future batch), QR scanning.

## Risks / open questions

- Monologue reference screenshot not yet provided — button styling is a tasteful guess until it is.
