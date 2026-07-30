export type PhaseKind = 'work' | 'rest'

export type Phase = {
  kind: PhaseKind
  label: string
  durationMs: number
}

/** Display preference only — the state machine always tracks elapsed time. */
export type Direction = 'down' | 'up'

export type PhasePlan = {
  title?: string
  direction: Direction
  phases: Phase[]
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

/**
 * The synced unit of truth (see STACK.md §3): an anchor timestamp plus the
 * plan. Displays derive the countdown locally from `now` — the network never
 * carries ticks.
 */
export type TimerState = {
  plan: PhasePlan
  status: TimerStatus
  /** Phase the anchor refers to (meaningful while running/paused). */
  phaseIndex: number
  /** Epoch ms when `phaseIndex` began. Set while running. */
  phaseAnchorMs: number | null
  /** Remaining ms in `phaseIndex` when paused. Set while paused. */
  pausedRemainingMs: number | null
}

export type TimerView = {
  status: TimerStatus
  phaseIndex: number
  phase: Phase | null
  phaseRemainingMs: number
  phaseElapsedMs: number
}
