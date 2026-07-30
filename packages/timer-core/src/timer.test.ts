import { describe, expect, it } from 'vitest'
import { derive, workPhaseProgress } from './derive'
import { formatClock } from './format'
import { makeIntervalPlan } from './plan'
import { createTimer, pause, reset, resume, skip, start } from './transitions'

const SEC = 1_000
const MIN = 60_000
// 3 cycles of 5on/5off with trailing rest dropped: work rest work rest work
const plan = makeIntervalPlan({ workMs: 5 * MIN, restMs: 5 * MIN, cycles: 3 })
const T0 = 1_700_000_000_000 // arbitrary epoch anchor for tests

describe('createTimer', () => {
  it('starts idle at phase 0 with full duration', () => {
    const s = createTimer(plan)
    expect(s.status).toBe('idle')
    const v = derive(s, T0)
    expect(v.phaseIndex).toBe(0)
    expect(v.phaseRemainingMs).toBe(5 * MIN)
    expect(v.phaseElapsedMs).toBe(0)
  })
})

describe('start + derive', () => {
  it('counts down as time passes', () => {
    const s = start(createTimer(plan), T0)
    expect(s.status).toBe('running')
    expect(derive(s, T0).phaseRemainingMs).toBe(5 * MIN)
    expect(derive(s, T0 + 90 * SEC).phaseRemainingMs).toBe(5 * MIN - 90 * SEC)
  })

  it('rolls over into the next phase at the boundary', () => {
    const s = start(createTimer(plan), T0)
    const v = derive(s, T0 + 5 * MIN + 10 * SEC)
    expect(v.phaseIndex).toBe(1)
    expect(v.phase?.kind).toBe('rest')
    expect(v.phaseRemainingMs).toBe(5 * MIN - 10 * SEC)
  })

  it('rolls over multiple phases after a long gap (offline display)', () => {
    const s = start(createTimer(plan), T0)
    const v = derive(s, T0 + 12 * MIN)
    expect(v.phaseIndex).toBe(2)
    expect(v.phase?.kind).toBe('work')
    expect(v.phaseRemainingMs).toBe(3 * MIN)
  })

  it('finishes when the whole plan has elapsed', () => {
    // 5 phases (W R W R W) × 5 min = 25 min total
    const s = start(createTimer(plan), T0)
    const v = derive(s, T0 + 25 * MIN + 1)
    expect(v.status).toBe('finished')
    expect(v.phaseRemainingMs).toBe(0)
  })

  it('never shows negative elapsed if a clock reads slightly behind the anchor', () => {
    const s = start(createTimer(plan), T0)
    const v = derive(s, T0 - 200)
    expect(v.phaseElapsedMs).toBe(0)
    expect(v.phaseRemainingMs).toBe(5 * MIN)
  })
})

describe('pause / resume', () => {
  it('pause freezes the remaining time', () => {
    const s = pause(start(createTimer(plan), T0), T0 + 2 * MIN)
    expect(s.status).toBe('paused')
    expect(derive(s, T0 + 10 * MIN).phaseRemainingMs).toBe(3 * MIN)
  })

  it('pause lands in the derived phase, not the anchored one', () => {
    const s = pause(start(createTimer(plan), T0), T0 + 6 * MIN)
    expect(s.phaseIndex).toBe(1)
    expect(derive(s, T0 + 6 * MIN).phaseRemainingMs).toBe(4 * MIN)
  })

  it('resume continues from where it paused', () => {
    const paused = pause(start(createTimer(plan), T0), T0 + 2 * MIN)
    const resumed = resume(paused, T0 + 60 * MIN)
    expect(resumed.status).toBe('running')
    expect(derive(resumed, T0 + 60 * MIN).phaseRemainingMs).toBe(3 * MIN)
    expect(derive(resumed, T0 + 61 * MIN).phaseRemainingMs).toBe(2 * MIN)
  })

  it('pausing past the end finishes the timer', () => {
    const s = pause(start(createTimer(plan), T0), T0 + 30 * MIN)
    expect(s.status).toBe('finished')
  })
})

describe('skip', () => {
  it('advances to the next phase and re-anchors', () => {
    const s = skip(start(createTimer(plan), T0), T0 + 90 * SEC)
    expect(s.status).toBe('running')
    const v = derive(s, T0 + 90 * SEC)
    expect(v.phaseIndex).toBe(1)
    expect(v.phaseRemainingMs).toBe(5 * MIN)
  })

  it('skips relative to the derived phase after rollover', () => {
    const s = skip(start(createTimer(plan), T0), T0 + 6 * MIN)
    expect(derive(s, T0 + 6 * MIN).phaseIndex).toBe(2)
  })

  it('skipping the last phase finishes', () => {
    let s = start(createTimer(plan), T0)
    for (let i = 1; i <= 5; i++) s = skip(s, T0 + i)
    expect(s.status).toBe('finished')
  })

  it('skip while paused stays paused with the next phase full', () => {
    const s = skip(
      pause(start(createTimer(plan), T0), T0 + 2 * MIN),
      T0 + 3 * MIN
    )
    expect(s.status).toBe('paused')
    const v = derive(s, T0 + 99 * MIN)
    expect(v.phaseIndex).toBe(1)
    expect(v.phaseRemainingMs).toBe(5 * MIN)
  })
})

describe('reset', () => {
  it('returns to idle from any state', () => {
    const s = reset(pause(start(createTimer(plan), T0), T0 + 2 * MIN))
    expect(s.status).toBe('idle')
    expect(derive(s, T0).phaseRemainingMs).toBe(5 * MIN)
    expect(derive(s, T0).phaseIndex).toBe(0)
  })
})

describe('workPhaseProgress', () => {
  it('reports the current work phase and total', () => {
    expect(workPhaseProgress(plan, 0)).toEqual({ current: 1, total: 3 })
    expect(workPhaseProgress(plan, 1)).toEqual({ current: 1, total: 3 })
    expect(workPhaseProgress(plan, 2)).toEqual({ current: 2, total: 3 })
    expect(workPhaseProgress(plan, 4)).toEqual({ current: 3, total: 3 })
  })
})

describe('formatClock', () => {
  it('ceils countdown remaining to whole seconds', () => {
    expect(formatClock(5 * MIN)).toBe('5:00')
    expect(formatClock(5 * MIN - 1)).toBe('5:00')
    expect(formatClock(299 * SEC)).toBe('4:59')
    expect(formatClock(SEC)).toBe('0:01')
    expect(formatClock(1)).toBe('0:01')
    expect(formatClock(0)).toBe('0:00')
  })

  it('floors elapsed time when counting up', () => {
    expect(formatClock(90 * SEC + 400, { mode: 'floor' })).toBe('1:30')
  })

  it('shows hours when needed', () => {
    expect(formatClock(90 * MIN)).toBe('1:30:00')
  })
})
