import type { Direction, Phase, PhasePlan } from './types'

const MIN = 60_000

export type IntervalPlanOptions = {
  workMs: number
  restMs: number
  cycles: number
  workLabel?: string
  restLabel?: string
  direction?: Direction
  title?: string
  /**
   * A trailing rest after the final work phase serves no one; dropped unless
   * a format genuinely ends on rest.
   */
  dropLastRest?: boolean
}

export function makeIntervalPlan({
  workMs,
  restMs,
  cycles,
  workLabel = 'CLIMB',
  restLabel = 'REST',
  direction = 'down',
  title,
  dropLastRest = true,
}: IntervalPlanOptions): PhasePlan {
  const phases: Phase[] = []
  for (let i = 0; i < cycles; i++) {
    phases.push({ kind: 'work', label: workLabel, durationMs: workMs })
    phases.push({ kind: 'rest', label: restLabel, durationMs: restMs })
  }
  if (dropLastRest) phases.pop()
  return { title, direction, phases }
}

/** Classic bouldering rotation: 5 minutes on the boulder, 5 minutes rest. */
export function fiveOnFiveOff(cycles: number, title?: string): PhasePlan {
  return makeIntervalPlan({ workMs: 5 * MIN, restMs: 5 * MIN, cycles, title })
}
