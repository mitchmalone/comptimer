# JOURNAL

> Append-only build log. **Newest at the top.** Each entry: date, title, then bullets whose lead is a bolded takeaway.

### 2026-07-31 — Phase 6: adjust, competitions, and buttons with real feel

- **`adjust(state, ±ms, now)` completes the transition set** (7 tests): shifts remaining time in the derived phase, clamped to [1s, duration] — a correction can't end a phase (that's skip's job) or overflow it. Works running (anchor shift) and paused (remainder shift).
- **Competitions shipped without touching contracts** — see the ADR: same session id, new plan per round, logos persisting on each publish. Control screen shows `title · n / N` and offers "Next: Finals" when a session finishes (or a quiet skip-ahead link).
- **Skeuomorphic pass in pure RN styles** (drop shadow + inner top highlight + sink-on-press): no expo-linear-gradient, no new native modules — deliberately, so Mitch's existing dev client keeps working over Metro. Colour-coded faces: green primary, amber pause, red reset.
- **Logo entry is URL fields** on setup (organizer + comma-separated sponsors) — rendering shipped in Phase 5; upload flow still deferred.

### 2026-07-30 — Phase 5: the display grew ears, resilience, and sponsors

- **Cue detection is pure timer-core logic** (`detectCues(prev, next)`, 10 tests): countdown ticks ≤5s, one-minute warning, phase-change horn (start and skip included, resume excluded), finish outranks phase change. Web maps cues to WebAudio square-wave tones — zero audio assets.
- **Autoplay policy shapes the UX:** sound is off until the speaker toggle is tapped once per page load; preference remembered but a gesture is still required — that's a browser rule, not ours.
- **Reconnect correctness:** broadcasts missed while disconnected/backgrounded are gone forever, so the display refetches the durable row on disconnected→connected and on tab-visible. The clock never depended on the connection; now the _state_ recovers too.
- **Contracts:** `logos[]` + `organizerLogoUrl` optional on SessionState (backward compatible — old payloads still parse). Display renders strip + title logo; upload flow still TBD.

### 2026-07-30 — First end-to-end run: phone drove the venue display

- **Phase 4 acceptance verified on a real device.** Dev client (ad-hoc, iPhone) + Metro → paired to app.comptimer.com by code → Start/Pause/Skip/Reset all reflected on the display. First-time device friction worth remembering: iOS 16+ requires **Developer Mode** (Settings → Privacy & Security) for ad-hoc builds, with a restart; TestFlight builds won't need it.
- **Credentials fully provisioned interactively:** reused the account's existing distribution certificate (shared with the backcountrygames apps), registered `com.comptimer.app`, ad-hoc profile with the registered iPhone. `eas build` from a real terminal — the harness shell has no TTY and eas-cli falls back to non-interactive.

### 2026-07-30 — Mobile delivery wired: EAS + TestFlight (backcountrygames conventions)

- **EAS project created and linked:** `@mitchmalone125/comptimer-app` (id in app.json; slug `comptimer` unavailable — previously used on the account). `eas.json` ports the backcountrygames shape: development (dev client, internal) / preview (internal) / production (autoIncrement), submit profile empty until the ASC app exists.
- **Supabase EXPO*PUBLIC*\* vars set on EAS** for development/preview/production environments (plaintext, via `eas env:create` — values never in the repo; profiles pin `environment` so cloud builds resolve them).
- **One-time interactive steps left for Mitch:** upload/reuse the ASC API key (`npx eas-cli credentials`), register phones (`npx eas-cli device:create`), and add `ascAppId` to `eas.json` submit config once the App Store Connect app record exists.
- **expo-dev-client now versions with the SDK** (~57.0.x, not ~7.x) — install with `npx expo install expo-dev-client`.

### 2026-07-30 — Phase 4: Supabase transport, pairing, mobile controller

- **Supabase provisioned via the Vercel Marketplace** (`vercel integration add supabase` from apps/web) after direct `supabase projects create` hit an org-permissions wall. Env vars auto-injected into comptimer-web and pulled locally; VITE\_ mirrors added to Vercel env; EXPO*PUBLIC* mirrors in apps/mobile/.env. Schema applied with libpq psql over `POSTGRES_URL_NON_POOLING` (no `supabase link` needed).
- **`packages/transport`**: `DisplayTransport`/`ControllerTransport` seam; Supabase impl. Controller sends go over Realtime's HTTP broadcast path (no persistent socket on the phone); display holds subscriptions. Clock offset via `server_time_ms()` RPC with half-RTT correction (`computeOffsetMs`, unit-tested).
- **Ordering matters in connect:** phone upserts the session row _before_ broadcasting the claim, so the display's initial fetch always finds state.
- **Web is pair-by-default now**: QR + code until claimed, then renders the phone's session; `sessionId` in localStorage so a refresh rehydrates from the row; connection dot bottom-right; `#demo` keeps the self-driving demo (also the jsdom smoke-test path, since jsdom has no WebSocket).
- **Device test pending** — Metro + workspace TS packages in Expo Go is the known risk; not verifiable without a phone.

### 2026-07-30 — Blank display: React 19 version-mismatch hard crash

- **Symptom: app.comptimer.com rendered nothing.** Root cause: React error #527 — `react` 19.2.3 (pinned exactly by the Expo template, hoisted workspace-wide) alongside `react-dom` 19.2.8 (floated via `^`). React 19 refuses to boot on mismatched copies. This is precisely the phantom-dependency tradeoff the hoisted-linker ADR warned about.
- **Rule going forward: `react` and `react-dom` are pinned exact and identical in every app.** All three React apps rebuilt and redeployed.
- **Debugging pattern that worked headless:** load the production `dist` bundle into jsdom and print `body.textContent` — surfaces minified React boot errors without a browser.

### 2026-07-30 — Phase 3: timer-core state machine + demo display

- **`timer-core` is real now:** `TimerState` (plan + anchor + pause remainder), pure transitions (`start/pause/resume/skip/reset`), and `derive(state, now)` which rolls elapsed time forward through phase boundaries — a frozen or offline display lands on the correct phase at its next frame. 23 tests, written first (red → green; three initial failures were bad arithmetic in the tests, not the implementation).
- **Transitions normalize before acting:** pause/skip first rewrite the anchor to the _derived_ phase so commands apply to what the crowd sees, not the phase the anchor was set in.
- **Contracts mirror timer-core with `satisfies z.ZodType<T>`** — schema/type drift is a compile error. `SessionState` (id, title, timer, `updatedAtMs`) defined ready for Phase 4.
- **Display:** work/rest colour switch, huge tabular-numeral clock (ceil for countdown — 0:00 only when truly done), BOULDER n/N indicator, temporary demo controls, `#pair` scaffold with unambiguous display code. Deployed to app.comptimer.com.

### 2026-07-30 — Marketing live; static export; a deploy-targeting lesson

- **All four domains now serve production.** www.comptimer.com came up once marketing was actually deployed — the earlier deploys had silently landed in `comptimer-api` because deploy retries ran in a shell whose working directory was still `apps/api`. Lesson: **every `vercel deploy` command must `cd` to the app directory in the same invocation**; verify the `Deploying <team>/<project>` line matches.
- **Marketing is `output: 'export'` (static).** No serverless functions means no file tracing, which is what broke prebuilt uploads across the workspace root. Revisit only if a marketing page ever needs SSR.

### 2026-07-30 — Phase 1 executed: workspace scaffolded, all apps deployed

- **All four web-facing apps are live on Vercel production** under the `ramenamok` team: comptimer-web (app.comptimer.com), comptimer-admin (admin.comptimer.com), comptimer-api (api.comptimer.com — `/health` returns `{"ok":true}`), comptimer-marketing (www + apex assigned, DNS records pending in Cloudflare).
- **Deploy path is local prebuilt, not remote build:** `vercel build` + `deploy --prebuilt`; see DECISIONS for the hoisted-linker rationale that unblocked it.
- **Hono-on-Vercel gotcha:** `hono/vercel`'s `handle` is Edge-only — on the Node runtime it hangs until FUNCTION_INVOCATION_TIMEOUT. Use `@hono/node-server/vercel`.
- **Vercel CLI notes:** installed CLI (brew) is v54; used `pnpm dlx vercel@latest` (v58). `vercel link --repo` (monorepo linking) is alpha and silently selects zero projects with `--yes`; per-app `vercel link --yes --project <name>` works.
- **Expo scaffold quirks:** `create-expo-app` prompts even with CI=1 after creating files (harmless); template ships its own AGENTS.md/CLAUDE.md (kept — they carry Expo SDK 57 guidance) and an Expo-copyright LICENSE (removed).

### 2026-07-30 — Roadmap reordered; Phase 1 plan written

- **Phases resequenced for visible progress:** marketing site moves ahead of product bones so something real is live early; web bones (with `timer-core`) precede mobile bones; communication lands with the mobile phase; polish phases follow per surface.
- **Phase 1 plan is agent-ready** (`docs/plans/active/phase-1-scaffolding.md`): full step list, acceptance criteria, and known risks (Expo-in-pnpm-workspace quirks, DNS verification).
- **CLI tooling confirmed available:** `vercel` (project linking, domains, deploys), `supabase` (Phase 4 provisioning), `cloudflared` (later, tunneling a local display for phone testing).

### 2026-07-30 — Project inception & docs scaffolding

- **Architecture settled before any code: sync state transitions, never ticks.** The network carries server-stamped commands and session state; each surface renders the countdown from its own (offset-corrected) clock. This makes the display resilient to venue Wi-Fi loss — the defining reliability property.
- **Supabase Realtime chosen as transport, Expo for mobile.** Both confirmed with Mitch; rationale in DECISIONS.md and STACK.md §2.
- **Repo conventions ported from psyke:** pnpm workspaces, Vitest colocated tests, ESLint 9 + Prettier, lefthook, Conventional Commits, rules/rationale split (AGENTS.md / STACK.md), volatile docs/ tree with plan lifecycle.
- **Known tension flagged, not solved: no-login + subscriptions.** Plan is anonymous device ID + RevenueCat when Phase 4 arrives; Apple's IAP cut pressures the $2.99/$9.99 price points.
