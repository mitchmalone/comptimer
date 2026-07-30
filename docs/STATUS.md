# STATUS

> The cursor. Where the build is right now, newest first. Keep this **terse** — detail belongs in JOURNAL.md, decisions in DECISIONS.md.

Last updated: 2026-07-31

> **Update (2026-07-31): Phase 6 verified via TestFlight — session closed with phases 1, 3, 4, 5, 6 done.** Mitch tested the full app from TestFlight build 0.1.0 (4): adjust, competitions, session advance all working against the live display. TestFlight pipeline is fully non-interactive now (`pnpm build:ios:mobile -- --auto-submit --non-interactive`). **Next session starts here:** Phase 2 (marketing — needs `/design-login`) or Phase 7 (RevenueCat + admin + license; note IAP is testable in TestFlight sandbox). Loose ends: Monologue screenshot for the button design pass, logo upload flow, `#demo` route is public, RLS tightening rides with Phase 7 identity.

> **Update (2026-07-31): Phase 6 code complete — adjust, competitions, skeuomorphic controls.** ±30s corrections (timer-core `adjust`, TDD'd), multi-session competitions phone-local under one session id, button pass in pure RN styles (no native deps — existing dev client still valid). PR #5.

> **Update (2026-07-30): Phase 5 built and deployed — sound, resilience, logos.** Cue detection TDD'd in timer-core (last-5s ticks, 1-min warning, phase horn, finish); WebAudio engine + speaker toggle on the display (autoplay policy: one tap to enable); refetch on reconnect + tab-visible; sponsor/organizer logo slots in contracts + display; final-5s red clock + phase progress bar. Listen-check pending: enable sound on app.comptimer.com/#demo and skip near a boundary. PR pending.

> **Update (2026-07-30): Phase 4 verified on device — the product works end to end.** Mitch paired his iPhone dev client to app.comptimer.com and drove the display live. EAS/TestFlight delivery wired (dev client built, credentials provisioned; `ascAppId` pending an ASC app record). Awaiting PR #3 merge. Next: Phase 2 (needs `/design-login`) or Phase 5 (web polish + sound).

> **Update (2026-07-30): Phase 4 code complete — pairing + realtime transport shipped, awaiting device test.** Supabase provisioned (Vercel Marketplace, env injected), `sessions` table + `server_time_ms()` migrated, `packages/transport` seam built, web is pair-by-default (`#demo` keeps the local demo), mobile has setup → connect → control. Needs Mitch: run the Expo app, enter the display code, press Start, confirm the TV responds. Phase 2 still blocked on `/design-login`.

> **Update (2026-07-30): Phase 3 built — app.comptimer.com counts down a real 5-on/5-off session.** `timer-core` state machine TDD'd (23 tests), Zod mirrors in contracts with drift protection, demo display + `#pair` scaffold deployed. Phase 2 (marketing) remains blocked on `/design-login`. Next: merge phase-3 PR, then Phase 2 or Phase 4 (pairing + Supabase transport).

> **Update (2026-07-30): Phase 1 done pending PR merge — all four domains live.** www/app/admin/api.comptimer.com all serve their placeholders; API health green; CI green on PR #1. Remaining: merge PR #1, verify Expo boots in Expo Go on a device.

> **Update (2026-07-30): Roadmap reordered for visible progress; Phase 1 plan active.** Order is now Scaffolding → Marketing → Web bones → Mobile bones + comms → Web polish → Mobile polish → Money. `docs/plans/active/phase-1-scaffolding.md` is fully specified and ready for an agent to execute.

> **Update (2026-07-30): Docs scaffolding in place.** Repo rules (AGENTS.md), stack law (STACK.md), roadmap, and plan template exist. No code yet.
