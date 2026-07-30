import { describe, expect, it } from 'vitest'
import { detectCues } from './cues'
import type { TimerView } from './types'

const SEC = 1_000

function view(partial: Partial<TimerView>): TimerView {
  return {
    status: 'running',
    phaseIndex: 0,
    phase: { kind: 'work', label: 'CLIMB', durationMs: 300 * SEC },
    phaseRemainingMs: 100 * SEC,
    phaseElapsedMs: 200 * SEC,
    ...partial,
  }
}

describe('detectCues', () => {
  it('ticks once per second through the final five seconds', () => {
    const cues = detectCues(
      view({ phaseRemainingMs: 5_100 }),
      view({ phaseRemainingMs: 4_900 })
    )
    expect(cues).toEqual(['countdownTick'])
  })

  it('does not tick twice within the same second', () => {
    const cues = detectCues(
      view({ phaseRemainingMs: 4_900 }),
      view({ phaseRemainingMs: 4_500 })
    )
    expect(cues).toEqual([])
  })

  it('does not tick above five seconds remaining', () => {
    const cues = detectCues(
      view({ phaseRemainingMs: 8_100 }),
      view({ phaseRemainingMs: 7_900 })
    )
    expect(cues).toEqual([])
  })

  it('fires the one-minute warning crossing 60s', () => {
    const cues = detectCues(
      view({ phaseRemainingMs: 60_200 }),
      view({ phaseRemainingMs: 59_900 })
    )
    expect(cues).toEqual(['oneMinuteWarning'])
  })

  it('fires phaseChange when the phase index advances while running', () => {
    const cues = detectCues(
      view({ phaseIndex: 0, phaseRemainingMs: 300 }),
      view({
        phaseIndex: 1,
        phase: { kind: 'rest', label: 'REST', durationMs: 300 * SEC },
        phaseRemainingMs: 300 * SEC,
      })
    )
    expect(cues).toEqual(['phaseChange'])
  })

  it('fires phaseChange when starting from idle', () => {
    const cues = detectCues(
      view({ status: 'idle', phaseElapsedMs: 0 }),
      view({ phaseElapsedMs: 50 })
    )
    expect(cues).toEqual(['phaseChange'])
  })

  it('does not fire when resuming from paused', () => {
    const cues = detectCues(view({ status: 'paused' }), view({}))
    expect(cues).toEqual([])
  })

  it('fires finish (not phaseChange) when the plan completes', () => {
    const cues = detectCues(
      view({ phaseIndex: 4, phaseRemainingMs: 300 }),
      view({ status: 'finished', phaseIndex: 4, phaseRemainingMs: 0 })
    )
    expect(cues).toEqual(['finish'])
  })

  it('is silent when nothing relevant changed', () => {
    const cues = detectCues(
      view({ phaseRemainingMs: 100_000 }),
      view({ phaseRemainingMs: 99_800 })
    )
    expect(cues).toEqual([])
  })

  it('is silent across pause and reset', () => {
    expect(detectCues(view({}), view({ status: 'paused' }))).toEqual([])
    expect(
      detectCues(view({}), view({ status: 'idle', phaseElapsedMs: 0 }))
    ).toEqual([])
  })
})
