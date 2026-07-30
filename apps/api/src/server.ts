// Local dev entry only — Vercel uses api/index.ts.
import { serve } from '@hono/node-server'
import { app } from './app'

serve({ fetch: app.fetch, port: 8787 })
