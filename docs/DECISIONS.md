# DECISIONS

> Lightweight ADR format. Newest at the top. Entry: date · title, then **Decision.** / **Why.** / **Tradeoff.**

### 2026-07-30 · Supabase via Vercel Marketplace; public channels + anon RLS for bones

**Decision.** The Supabase project is provisioned through the Vercel Marketplace integration (unified billing, env auto-injection). Phase-4 security posture: Realtime broadcast on public channels and RLS policies letting `anon` read/write `sessions` rows keyed by unguessable uuid.

- **Why.** No auth exists yet by design (no-login product); uuid keys make rows and channels unguessable-in-practice; this unblocks the product spine without building identity early. The Marketplace path also survived where direct `supabase projects create` failed on org permissions.
- **Tradeoff.** Anyone with a session uuid or display code could interfere; codes are short-lived and sessions are uuids, but this is not launch-grade. Tighten alongside device identity in Phase 7 (private channels + scoped policies).

### 2026-07-30 · Timer state = anchor + derivation; transitions normalize first

**Decision.** `TimerState` stores a phase index plus the epoch when that phase began (`phaseAnchorMs`); `derive(state, now)` computes the visible phase/remaining by walking forward through phase durations. Transitions are pure `(state, now) → state` and re-anchor to the derived position before acting.

- **Why.** This is the sync model from STACK.md §3 made concrete: the network ships tiny state objects, every screen renders from its own clock, gaps (offline, frozen tab) self-heal because the anchor never moves. Normalizing before pause/skip means commands apply to the phase the crowd is watching.
- **Tradeoff.** Slightly more subtle than a decrementing counter — the invariant "never store remaining time while running" must hold everywhere. Enforced by keeping all of it inside `timer-core` behind tests.

### 2026-07-30 · Hoisted node linker + prebuilt Vercel deploys

**Decision.** `nodeLinker: hoisted` in `pnpm-workspace.yaml` (real `node_modules` directories, no symlinked `.pnpm` store), and apps deploy to Vercel via `vercel build` + `vercel deploy --prebuilt` (build locally/in CI where the workspace exists, upload output).

- **Why.** Prebuilt uploads `lstat` traced files — symlinks into the root `.pnpm` store broke both the Hono function and Next.js deploys. Hoisted layout also matches what Expo/Metro tooling expects in monorepos. Prebuilt deploys sidestep remote-build workspace issues (`tsconfig.base.json` outside the upload) entirely. The API additionally esbuild-bundles to a single self-contained `api/index.mjs` (`framework: null` in `vercel.json` — Vercel's Hono preset would otherwise build a second, broken function).
- **Tradeoff.** Loses pnpm's strict dependency isolation (phantom deps possible). Git-integration deploys (push-to-deploy with per-project root directories) can replace prebuilt CLI deploys later.

### 2026-07-30 · Roadmap ordered for visible progress, not dependency purity

**Decision.** Build order: Scaffolding → Marketing site → Web app bones → Mobile app bones + communication → Web polish → Mobile polish → Payments/admin. Timer-core lands with web bones (its first consumer); realtime lands with mobile bones (its first producer).

- **Why.** Something visible ships from the first phases (live domains, then a real marketing site, then a counting display). Each phase ends with a demo you can point at.
- **Tradeoff.** Marketing before product means the site briefly advertises something that doesn't work yet; accepted for momentum.

### 2026-07-30 · Sync state transitions over Supabase Realtime, never stream ticks

**Decision.** Surfaces synchronise by broadcasting server-stamped state transitions (start/pause/skip/reset + phase plan) over Supabase Realtime channels, with a Postgres `sessions` row as durable state. Each client renders the countdown locally from a clock-offset-corrected `now`. The network never carries per-second updates.

- **Why.** Reliability is the product. Latency then only affects the edge of a button press; the display keeps counting correctly while offline; reconnect is a state fetch, not a replay. Supabase is already in the stack — managed WebSockets with no server to operate.
- **Tradeoff.** Requires clock-offset estimation and disciplined state modelling up front. Rejected: raw WebSockets on Vercel Fluid Compute (hand-built fan-out, per-connection-duration cost, newer), Ably/PartyKit (new vendor for a solved problem).

### 2026-07-30 · Vite SPA for the display, not Next.js

**Decision.** `apps/web` is a client-only React + Vite SPA.

- **Why.** Full-screen crowd display: no SEO, no server rendering, one route that matters. Vite is the smallest thing that works.
- **Tradeoff.** The marketing site (which does want SSR/SEO) becomes a separate app later rather than a route.

### 2026-07-30 · Expo managed workflow for mobile

**Decision.** `apps/mobile` uses Expo, not bare React Native.

- **Why.** EAS builds, OTA updates mid-comp-season, deep-link/QR pairing support nearly free. No exotic native modules anticipated.
- **Tradeoff.** A layer of abstraction over the native projects; eject path exists if ever needed.

### 2026-07-30 · Timing semantics live in one pure package

**Decision.** All phase-plan and transition logic lives in `packages/timer-core`: pure TypeScript, injected time, no I/O, red/green TDD.

- **Why.** Phone and TV must never disagree about what a plan means; pure functions are where TDD pays off hardest; both surfaces import the same brain.
- **Tradeoff.** Discipline required — apps will be tempted to inline "just one" duration calculation. The invariant in AGENTS.md exists for this.

### 2026-07-30 · Phone is the authority; pairing is phone-claims-display

**Decision.** Sessions are created and owned by the mobile app. The web display generates an ephemeral code + QR and listens; the phone scans and claims it, attaching its prepared session.

- **Why.** Lets organisers prepare sessions ahead of time and connect at the venue in seconds; keeps the display logic-free.
- **Tradeoff.** A display alone can do nothing — acceptable, that's the product shape.
