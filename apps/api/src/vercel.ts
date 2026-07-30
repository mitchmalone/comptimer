// Bundled by esbuild into api/index.mjs — the self-contained Vercel entry.
// Node runtime, so the handle comes from @hono/node-server (hono/vercel is Edge-only).
import { handle } from '@hono/node-server/vercel'
import { app } from './app'

export default handle(app)
