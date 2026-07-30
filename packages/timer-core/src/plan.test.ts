import { describe, expect, it } from 'vitest'
import { fiveOnFiveOff, makeIntervalPlan } from './plan'

const MIN = 60_000

describe('makeIntervalPlan', () => {
  it('alternates work and rest for the given cycles', () => {
    const plan = makeIntervalPlan({
      workMs: 4 * MIN,
      restMs: 2 * MIN,
      cycles: 3,
      dropLastRest: false,
    })
    expect(plan.phases.map((p) => p.kind)).toEqual([
      'work',
      'rest',
      'work',
      'rest',
      'work',
      'rest',
    ])
    expect(plan.phases[0]?.durationMs).toBe(4 * MIN)
    expect(plan.phases[1]?.durationMs).toBe(2 * MIN)
  })

  it('drops the trailing rest by default', () => {
    const plan = makeIntervalPlan({ workMs: MIN, restMs: MIN, cycles: 2 })
    expect(plan.phases.map((p) => p.kind)).toEqual(['work', 'rest', 'work'])
  })

  it('labels phases and counts down by default', () => {
    const plan = makeIntervalPlan({ workMs: MIN, restMs: MIN, cycles: 1 })
    expect(plan.phases[0]?.label).toBe('CLIMB')
    expect(plan.direction).toBe('down')
  })
})

describe('fiveOnFiveOff', () => {
  it('is 5 minutes on, 5 minutes off', () => {
    const plan = fiveOnFiveOff(4)
    expect(plan.phases[0]).toMatchObject({ kind: 'work', durationMs: 5 * MIN })
    expect(plan.phases[1]).toMatchObject({ kind: 'rest', durationMs: 5 * MIN })
    // 4 work phases, trailing rest dropped
    expect(plan.phases.filter((p) => p.kind === 'work')).toHaveLength(4)
    expect(plan.phases.at(-1)?.kind).toBe('work')
  })
})
