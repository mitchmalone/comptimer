# CompTimer — STACK.md

Source of truth for stack decisions and their rationale. Stable law: change it deliberately, via a PR that also records the change in `docs/DECISIONS.md`. Operating rules live in `AGENTS.md`; volatile state lives in `docs/`.

## 1. Guiding principles

1. **Reliability is the product.** A timer that drifts, stalls, or dies when venue Wi-Fi hiccups is worthless. Every architectural choice is judged against this first.
2. **The phone does the heavy lifting; the display is dumb.** Session creation, configuration, and every command live on mobile. The web display renders state and counts locally.
3. **Pure core, thin shells.** All timing semantics live in one pure TypeScript package, fully unit-tested, shared by every surface — the phone and the TV can never disagree about what "5 on / 5 off" means.
4. **Simple and testable over clever.** Red/green TDD for domain logic. Boring, replaceable infrastructure.
5. **Open source.** No secrets in the repo; nothing in the architecture assumes a private codebase.

## 2. The stack (locked)

Broken down by surface. Every choice below is per-application — nothing here implies a technology is used anywhere it isn't listed.

### Shared foundation (whole repo)

- **TypeScript everywhere**, strict, via one shared `tsconfig.base.json`.
- **pnpm workspaces** (`apps/*`, `packages/*`) — no Turbo/Nx until it hurts.
- **Vitest** for tests, colocated `*.test.ts(x)`.
- **ESLint 9 flat config + Prettier 3**; **lefthook** (pre-commit fix, commit-msg commitlint, pre-push test).
- **Supabase Postgres** as the single durable store (session state; later purchases, logs).
- **Vercel** hosts every web-deployed app.

### `apps/web` — crowd display (app.comptimer.com)

- **React + Vite, client-only SPA.** No Next: it's a full-screen client-rendered app with no SEO and one route that matters — Vite is smaller, faster, simpler.
- **Supabase Realtime subscriber** (via the transport interface) for session state; renders the countdown locally.
- Owns audio (beeps) when Phase 3 arrives.

### `apps/mobile` — judge's controller

- **React Native via Expo** (managed workflow, CNG — native dirs are generated, never committed). Not bare RN: no exotic native modules needed. React Native and Expo appear **only** here.
- **Delivery: EAS Build + EAS Submit → TestFlight.** Real builds are the artifact; Expo Go is not a delivery or testing path. `pnpm build:ios:mobile` / `pnpm submit:ios:mobile` from the root (thin `--filter` wrappers so the CWD is pinned inside the app — never run `eas` against the repo root).
- **Testing happens on TestFlight builds.** Ship `production` with `--auto-submit` and test the fully-loaded app — no Metro tether (Mitch tests away from home). The ad-hoc dev client (`build:ios:dev` + Metro) exists only for at-desk iteration on JS. **Dev clients never go to TestFlight** — they'd replace the real app as "latest" for testers.
- **Versioning:** `appVersionSource: remote`, production `autoIncrement` — build numbers live on EAS. Marketing version hand-bumped in `app.json`. **No OTA/expo-updates**: every change ships as a native build.
- **Credentials:** EAS-managed; one ASC API key uploaded to EAS (interactive, once). Supabase `EXPO_PUBLIC_*` config lives in EAS env vars per environment, not in the repo.
- **Supabase Realtime publisher/subscriber** (via the transport interface); the only surface that issues commands.
- Later: RevenueCat for purchases (deferred, §6).

### `apps/api` — backend (api routes under Vercel)

- **Hono on Vercel** (Fluid Compute, Node runtime). Pairing endpoints, admin auth, later Stripe/RevenueCat webhooks.
- The only surface holding the Supabase service-role key.

### `apps/admin` — internal ops (admin.comptimer.com)

- **React + Vite SPA**, password-gated through `apps/api` (hardcoded password in env). Deliberately minimal.

### `apps/marketing` — marketing site (www.comptimer.com, later)

- **Next.js** — the one surface that wants SSR/SEO. Not started; built from the design assets when Phase 4 arrives.

### `packages/*` — shared code

- **`contracts`**: Zod + inferred types. No framework dependencies.
- **`timer-core`**: pure TypeScript, zero dependencies, no I/O.

### Realtime transport (web ↔ mobile)

- **Supabase Realtime** — managed WebSockets we already pay for, with Postgres beside it for durable state. Rejected: raw WebSockets on Vercel (hand-built fan-out, per-connection-duration cost), Ably/PartyKit (new vendor for a solved problem). Decided 2026-07-30 — see `docs/DECISIONS.md`.

## 3. Architecture seams

- **`packages/contracts` is the keystone.** Every message between surfaces — commands, session state, pairing payloads — is a Zod schema with inferred types. Runtime-validated at every boundary.
- **`packages/timer-core` is pure.** The state machine for phase plans (work/rest periods, counts, direction up/down), transitions (start/pause/resume/skip/reset/adjust), and elapsed-time math. Time is injected; no I/O. This is where TDD lives.
- **Transport is behind an interface.** Apps depend on a small `SessionTransport` abstraction (subscribe, publish transition, fetch state). Supabase Realtime is the implementation. Swappable without touching feature code.

### Sync model: state transitions, never ticks

The network never carries a countdown. It carries **transitions**: a server-stamped record of what changed (`started`, `paused`, `skipped`, plan itself). Each client renders time locally against a clock-offset-corrected `now`. Consequences:

- Latency only affects the edge of a button press (~100–300 ms, imperceptible), never clock accuracy.
- The display keeps counting correctly while fully offline; only new commands need connectivity.
- Reconnect = fetch current state from the `sessions` row, resume. No message-replay problem.

### Pairing flow

1. Web display generates an ephemeral display code, renders it as a QR (deep link into the mobile app), and listens on channel `display:{code}`.
2. The judge — who prepared the session on the phone ahead of time — scans, and the phone claims the display by publishing the session id to that channel.
3. Both surfaces move to `session:{id}`. The display stays dumb from here on.

### Session / competition model

- **Session** — one timed block: a title, a phase plan (e.g. 5 on / 5 off × N), optional logos. The atomic unit.
- **Competition** — an ordered group of sessions (qualifiers, finals) sharing titles-per-session and persistent sponsor/organizer logos.

## 4. Repo structure

```
apps/
  web/          crowd display — app.comptimer.com
  mobile/       Expo controller app
  admin/        session/log inspection — admin.comptimer.com
  api/          Hono — pairing endpoints, admin auth, later webhooks
  marketing/    (later) — www.comptimer.com
packages/
  contracts/    Zod schemas + inferred types
  timer-core/   pure timer state machine
docs/           STATUS · ROADMAP · JOURNAL · DECISIONS · plans/
```

## 5. Definition of done

See `AGENTS.md`. Short version: typecheck, lint, tests green with coverage of new package logic, invariants intact, docs updated in the same PR.

## 6. Deferred decisions

- **Payments.** $2.99/mo unlimited or $9.99 single-day, no login. Purchases still need an identity: plan is an anonymous device-scoped ID + RevenueCat (wraps Apple/Google IAP and Stripe). Note Apple's IAP cut (15–30%) pressures these price points — revisit pricing when built.
- **Auth.** None for v1 beyond the anonymous device ID and the hardcoded admin password (env secret).
- **Sound design.** Beeps (final seconds, phase change) are emitted by the web display. Required for bouldering; not in the bones.
- **Sponsor logo management.** Displayed by web, configured from mobile; storage/upload flow TBD (likely Supabase Storage).
- **More presets.** Bouldering 5-on/5-off and custom first; lead climbing, soccer, basketball later. `timer-core` phase plans must be general enough to express them from day one.
- **Marketing site** and open-source license choice.

## 7. Out of scope (v1)

Accounts, multi-judge sessions, results/scoring, spectator mobile views, native TV apps.
