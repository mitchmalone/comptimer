import type { PhasePlan, TimerState, TimerView } from './types'

function phaseDuration(state: TimerState, index: number): number {
  return state.plan.phases[index]?.durationMs ?? 0
}

function finishedView(state: TimerState): TimerView {
  const last = Math.max(0, state.plan.phases.length - 1)
  return {
    status: 'finished',
    phaseIndex: last,
    phase: state.plan.phases[last] ?? null,
    phaseRemainingMs: 0,
    phaseElapsedMs: phaseDuration(state, last),
  }
}

/**
 * Project the state onto a wall-clock instant. Running time flows through
 * phase boundaries here — a display that was frozen or offline rolls forward
 * to the correct phase on its next frame, because the anchor never moved.
 */
export function derive(state: TimerState, nowMs: number): TimerView {
  const { status, phaseIndex } = state

  if (status === 'idle') {
    return {
      status,
      phaseIndex: 0,
      phase: state.plan.phases[0] ?? null,
      phaseRemainingMs: phaseDuration(state, 0),
      phaseElapsedMs: 0,
    }
  }

  if (status === 'finished') return finishedView(state)

  if (status === 'paused') {
    const remaining = state.pausedRemainingMs ?? 0
    return {
      status,
      phaseIndex,
      phase: state.plan.phases[phaseIndex] ?? null,
      phaseRemainingMs: remaining,
      phaseElapsedMs: phaseDuration(state, phaseIndex) - remaining,
    }
  }

  // running: walk forward from the anchor consuming whole phases
  let elapsed = Math.max(0, nowMs - (state.phaseAnchorMs ?? nowMs))
  let index = phaseIndex
  while (index < state.plan.phases.length) {
    const duration = phaseDuration(state, index)
    if (elapsed < duration) {
      return {
        status: 'running',
        phaseIndex: index,
        phase: state.plan.phases[index] ?? null,
        phaseRemainingMs: duration - elapsed,
        phaseElapsedMs: elapsed,
      }
    }
    elapsed -= duration
    index++
  }
  return finishedView(state)
}

/** "Boulder 2 of 4" — position among work phases, for the period indicator. */
export function workPhaseProgress(
  plan: PhasePlan,
  phaseIndex: number
): { current: number; total: number } {
  const total = plan.phases.filter((p) => p.kind === 'work').length
  let current = 0
  for (let i = 0; i <= Math.min(phaseIndex, plan.phases.length - 1); i++) {
    if (plan.phases[i]?.kind === 'work') current++
  }
  return { current: Math.max(1, current), total }
}
