import 'react-native-url-polyfill/auto'
import {
  createSupabaseTransport,
  type ControllerTransport,
} from '@comptimer/transport'

let cached: ControllerTransport | null | undefined

/** null when EXPO_PUBLIC_ env vars are missing — see .env.example. */
export function getControllerTransport(): ControllerTransport | null {
  if (cached !== undefined) return cached
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  cached =
    url && anonKey ? createSupabaseTransport({ url, anonKey }).controller : null
  return cached
}
