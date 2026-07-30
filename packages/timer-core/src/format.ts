export type FormatClockOptions = {
  /**
   * 'ceil' (default) for countdowns — the clock reads 0:00 only when time is
   * truly up. 'floor' for count-up displays.
   */
  mode?: 'ceil' | 'floor'
}

export function formatClock(
  ms: number,
  { mode = 'ceil' }: FormatClockOptions = {}
): string {
  const totalSeconds =
    mode === 'ceil' ? Math.ceil(ms / 1000) : Math.floor(ms / 1000)
  const s = Math.max(0, totalSeconds)
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const mm = String(minutes).padStart(hours > 0 ? 2 : 1, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}
