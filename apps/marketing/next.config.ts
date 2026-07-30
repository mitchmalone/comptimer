import path from 'node:path'
import type { NextConfig } from 'next'

const config: NextConfig = {
  // pnpm monorepo: trace files from the workspace root so deploys
  // resolve the hoisted node_modules/.pnpm store correctly
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
}

export default config
