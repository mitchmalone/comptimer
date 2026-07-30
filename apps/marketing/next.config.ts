import path from 'node:path'
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Static export: the marketing site has no server-side needs, and it keeps
  // prebuilt CLI deploys free of function tracing (which breaks across the
  // workspace root). Revisit if a page ever needs SSR/ISR.
  output: 'export',
  // pnpm monorepo: trace files from the workspace root so deploys
  // resolve the hoisted node_modules/.pnpm store correctly
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
}

export default config
