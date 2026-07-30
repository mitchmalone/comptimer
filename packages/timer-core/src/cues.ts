import type { TimerView } from './types'

export type CueEvent =
  'countdownTick' | 'oneMinuteWarning' | 'phaseChange' | 'finish'

const wholeSeconds = (ms: number) => Math.ceil(ms / 1000)

/**
 * Edge-detect audible cues between two consecutive frames of the same timer.
 * Pure — callers keep the previous view and map events to actual sounds.
 */
export function detectCues(prev: TimerView, next: TimerView): CueEvent[] {
  // Finish outranks everything and fires exactly once.
  if (next.status === 'finished') {
    return prev.status !== 'finished' && prev.status !== 'idle'
      ? ['finish']
      : []
  }

  if (next.status !== 'running') return []

  // Start signal: idle → running. A resume (paused → running) is silent.
  if (prev.status === 'idle') return ['phaseChange']
  if (prev.status !== 'running') return []

  // Rotation signal: the display rolled (or was skipped) into a new phase.
  if (next.phaseIndex !== prev.phaseIndex) return ['phaseChange']

  const prevSec = wholeSeconds(prev.phaseRemainingMs)
  const nextSec = wholeSeconds(next.phaseRemainingMs)
  if (nextSec === prevSec) return []

  if (prevSec > 60 && nextSec <= 60) return ['oneMinuteWarning']
  if (nextSec >= 1 && nextSec <= 5) return ['countdownTick']
  return []
}
