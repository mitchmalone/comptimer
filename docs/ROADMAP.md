# ROADMAP

> Phases in order, sequenced for **visible progress early**. Each phase ships as one or more complete-value PRs and starts by copying `docs/plans/_TEMPLATE.md` into `docs/plans/active/`. Detail lives in the plan; this stays coarse. "You can see" = the demo that proves the phase.

## Phase 1 — Scaffolding (current)

Workspace, tooling, CI, and placeholder apps deployed end-to-end.

- pnpm workspace, `tsconfig.base.json`, ESLint 9 + Prettier 3, Vitest, lefthook + commitlint, GitHub Actions CI
- Scaffold all apps: `web` (Vite), `admin` (Vite), `api` (Hono), `mobile` (Expo), `marketing` (Next placeholder)
- Scaffold `packages/contracts` and `packages/timer-core` with one passing test each (proves the pipeline)
- Vercel projects linked; domains pointed (www / app / admin .comptimer.com)

**You can see:** placeholder pages live on all three domains; CI green; Expo app boots in Expo Go.
→ Plan: `docs/plans/active/phase-1-scaffolding.md`

## Phase 2 — Marketing site

`apps/marketing` built out from the design assets (claude_design import — requires `/design-login`).

**You can see:** a real marketing site at www.comptimer.com.

## Phase 3 — Web app bones

The display becomes a real timer, running locally (no phone yet).

- `packages/contracts`: phase plan + session state schemas
- `packages/timer-core`: TDD'd state machine — 5 on / 5 off preset, custom plans, start/pause/resume/skip/reset, count up/down
- `apps/web`: huge timer rendering a demo session via timer-core; pairing screen scaffold (display code + QR, not yet live)

**You can see:** app.comptimer.com counting down a 5-on/5-off session in demo mode.

## Phase 4 — Mobile app bones + communication

The two surfaces meet. This is the product's spine.

- Supabase project, `sessions` table, `SessionTransport` interface + Realtime implementation
- `apps/mobile`: minimal session setup (bouldering preset or custom periods/durations/rests), QR scan, pairing claim
- Real pairing flow; phone commands (start/stop/reset) drive the TV; server-stamped transitions + clock-offset correction; display rehydrates on refresh

**You can see:** scan the QR with the phone, press Start, the TV responds.

## Phase 5 — Improve the web app

Display polish for a real venue.

- Period/half indicator, session title, sponsor + organizer logos
- Sound cues (final seconds, phase change)
- Offline resilience hardening + subtle connection indicator
- Design pass from design assets

**You can see:** a display you'd actually put in front of a crowd.

## Phase 6 — Improve the mobile app

Controller polish for a real judge.

- Run screen: 50/50 split — display mirror on top, skeuomorphic controls below
- Skip / adjust timers mid-session
- Competitions: ordered groups of sessions, titles per session, persistent logos
- Design pass from design assets

**You can see:** a full competition run end-to-end from the phone.

## Phase 7 — Money & doors

- Anonymous device identity + RevenueCat ($2.99/mo, $9.99 day pass)
- `apps/admin`: session inspection, logs, hardcoded-password gate
- License selection, launch prep

## Later

More presets (lead climbing, soccer, basketball), sponsor logo upload flow, spectator views.
