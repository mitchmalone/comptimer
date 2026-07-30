---
title: Phase 4 — Mobile app bones + communication
status: done
created: 2026-07-30
updated: 2026-07-30
links: [docs/ROADMAP.md, STACK.md]
---

# Task

## Goal

Scan/enter a display code on the phone, press Start, and the TV responds: real pairing over Supabase Realtime, phone as the only command source, display rehydrating from the sessions row on refresh.

## Context

The product's spine. timer-core and contracts exist (Phase 3); the display currently runs a local demo. Supabase is provisioned via the Vercel Marketplace integration (project in the Vercel-managed org; env vars injected into comptimer-web and pulled locally). `sessions` table + `server_time_ms()` migrated.

## Approach

New `packages/transport`: a `SessionTransport` seam (display side: wait-for-claim, subscribe, fetch; controller side: claim, publish) with the Supabase Realtime implementation behind it. Broadcast channels `display:{code}` and `session:{id}`; durable state upserted to `sessions`. Clock offset estimated once via `server_time_ms()` and applied to every `derive`/transition `now`.

Web: default screen becomes the pairing flow (code + QR); demo moves to `#demo`. Mobile: three-step flow — session setup (5-on/5-off preset or custom) → enter display code → control screen with mirror + Start/Pause/Skip/Reset.

## Steps

- [x] Supabase provisioned + `sessions` migration applied (RLS: anon by-uuid access for bones; tighten in Phase 7)
- [ ] `contracts`: `ClaimMessage`, channel-name helpers
- [ ] `packages/transport`: interface + Supabase impl + offset estimation; unit tests for pure parts
- [ ] `apps/web`: pair-by-default flow, QR of the display code, remote-driven TimerScreen, rehydrate from row, connection indicator, `#demo` keeps local demo
- [ ] `apps/mobile`: setup → connect → control screens; transitions applied with offset-corrected now; publish on every command
- [ ] Env: `.env.example`s committed; VITE_ vars on Vercel project
- [ ] Deploy web; verify pairing e2e (needs a phone — Mitch)

## Acceptance criteria

- [x] Phone Start/Pause/Skip/Reset visibly drives app.comptimer.com
- [x] Display refresh mid-session resumes correct time without phone involvement
- [x] All tests green; docs closed out in the PR

## Out of scope

QR _scanning_ on the phone (code entry first; camera scan when we do a dev build), sound, competitions, payments, admin.

## Risks / open questions

- Metro + workspace TS packages in Expo Go — first real test of the monorepo on device.
- Realtime broadcast on public channels (no auth) — acceptable for bones, revisit with device identity.
