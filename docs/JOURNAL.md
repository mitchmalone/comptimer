# JOURNAL

> Append-only build log. **Newest at the top.** Each entry: date, title, then bullets whose lead is a bolded takeaway.

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
