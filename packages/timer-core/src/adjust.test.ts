import { describe, expect, it } from 'vitest'
import { derive } from './derive'
import { makeIntervalPlan } from './plan'
import { adjust, createTimer, pause, start } from './transitions'

const SEC = 1_000
const MIN = 60_000
const plan = makeIntervalPlan({ workMs: 5 * MIN, restMs: 5 * MIN, cycles: 3 })
const T0 = 1_700_000_000_000

describe('adjust', () => {
  it('adds time to the running phase', () => {
    const s = start(createTimer(plan), T0)
    const adjusted = adjust(s, 30 * SEC, T0 + MIN)
    expect(derive(adjusted, T0 + MIN).phaseRemainingMs).toBe(4 * MIN + 30 * SEC)
  })

  it('removes time from the running phase', () => {
    const s = start(createTimer(plan), T0)
    const adjusted = adjust(s, -30 * SEC, T0 + MIN)
    expect(derive(adjusted, T0 + MIN).phaseRemainingMs).toBe(4 * MIN - 30 * SEC)
  })

  it('clamps so remaining never exceeds the phase duration', () => {
    const s = start(createTimer(plan), T0)
    const adjusted = adjust(s, 10 * MIN, T0 + MIN)
    expect(derive(adjusted, T0 + MIN).phaseRemainingMs).toBe(5 * MIN)
  })

  it('clamps so a negative adjustment cannot end the phase', () => {
    const s = start(createTimer(plan), T0)
    const adjusted = adjust(s, -10 * MIN, T0 + MIN)
    expect(derive(adjusted, T0 + MIN).phaseRemainingMs).toBe(SEC)
    expect(derive(adjusted, T0 + MIN).phaseIndex).toBe(0)
  })

  it('adjusts the derived phase after rollover, not the anchored one', () => {
    const s = start(createTimer(plan), T0)
    const adjusted = adjust(s, 30 * SEC, T0 + 6 * MIN)
    const v = derive(adjusted, T0 + 6 * MIN)
    expect(v.phaseIndex).toBe(1)
    expect(v.phaseRemainingMs).toBe(4 * MIN + 30 * SEC)
  })

  it('adjusts the frozen remainder while paused', () => {
    const s = pause(start(createTimer(plan), T0), T0 + MIN)
    const adjusted = adjust(s, 30 * SEC, T0 + 2 * MIN)
    expect(derive(adjusted, T0 + 9 * MIN).phaseRemainingMs).toBe(
      4 * MIN + 30 * SEC
    )
    expect(adjusted.status).toBe('paused')
  })

  it('is a no-op when idle or finished', () => {
    const idle = createTimer(plan)
    expect(adjust(idle, 30 * SEC, T0)).toEqual(idle)
    let s = start(createTimer(plan), T0)
    s = { ...s, status: 'finished', phaseAnchorMs: null }
    expect(adjust(s, 30 * SEC, T0)).toEqual(s)
  })
})
