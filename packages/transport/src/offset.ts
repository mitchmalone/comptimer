/**
 * serverNow − localNow given one RPC round trip. Assumes the server read the
 * clock mid-flight, so half the round trip corrects the reading.
 */
export function computeOffsetMs(
  localBeforeMs: number,
  localAfterMs: number,
  serverMs: number
): number {
  const localMidpoint = localBeforeMs + (localAfterMs - localBeforeMs) / 2
  return serverMs - localMidpoint
}
