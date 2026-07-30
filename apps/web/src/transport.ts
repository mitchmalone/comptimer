import {
  createSupabaseTransport,
  type DisplayTransport,
} from '@comptimer/transport'

let cached: DisplayTransport | null | undefined

/** null when env vars are missing (e.g. a fork without `vercel env pull`). */
export function getDisplayTransport(): DisplayTransport | null {
  if (cached !== undefined) return cached
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  cached =
    url && anonKey ? createSupabaseTransport({ url, anonKey }).display : null
  return cached
}
