import { derive } from './derive'
import type { PhasePlan, TimerState } from './types'

export function createTimer(plan: PhasePlan): TimerState {
  return {
    plan,
    status: 'idle',
    phaseIndex: 0,
    phaseAnchorMs: null,
    pausedRemainingMs: null,
  }
}

/**
 * Rewrite the anchor so the derived position becomes explicit state. Applied
 * before every transition so pause/skip act on the phase the crowd is seeing,
 * not the phase the anchor was set in.
 */
function normalize(state: TimerState, nowMs: number): TimerState {
  if (state.status !== 'running') return state
  const v = derive(state, nowMs)
  if (v.status === 'finished') {
    return { ...state, status: 'finished', phaseAnchorMs: null }
  }
  return {
    ...state,
    phaseIndex: v.phaseIndex,
    phaseAnchorMs: nowMs - v.phaseElapsedMs,
  }
}

export function start(state: TimerState, nowMs: number): TimerState {
  if (state.status === 'idle') {
    return { ...state, status: 'running', phaseIndex: 0, phaseAnchorMs: nowMs }
  }
  if (state.status === 'paused') {
    const duration = state.plan.phases[state.phaseIndex]?.durationMs ?? 0
    const remaining = state.pausedRemainingMs ?? duration
    return {
      ...state,
      status: 'running',
      phaseAnchorMs: nowMs - (duration - remaining),
      pausedRemainingMs: null,
    }
  }
  return state
}

export const resume = start

export function pause(state: TimerState, nowMs: number): TimerState {
  if (state.status !== 'running') return state
  const s = normalize(state, nowMs)
  if (s.status !== 'running') return s
  const v = derive(s, nowMs)
  return {
    ...s,
    status: 'paused',
    phaseAnchorMs: null,
    pausedRemainingMs: v.phaseRemainingMs,
  }
}

export function skip(state: TimerState, nowMs: number): TimerState {
  if (state.status === 'running') {
    const s = normalize(state, nowMs)
    if (s.status !== 'running') return s
    const next = s.phaseIndex + 1
    if (next >= s.plan.phases.length) {
      return { ...s, status: 'finished', phaseAnchorMs: null }
    }
    return { ...s, phaseIndex: next, phaseAnchorMs: nowMs }
  }
  if (state.status === 'paused') {
    const next = state.phaseIndex + 1
    if (next >= state.plan.phases.length) {
      return { ...state, status: 'finished', pausedRemainingMs: null }
    }
    return {
      ...state,
      phaseIndex: next,
      pausedRemainingMs: state.plan.phases[next]?.durationMs ?? 0,
    }
  }
  return state
}

export function reset(state: TimerState): TimerState {
  return createTimer(state.plan)
}
