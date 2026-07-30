// Placeholder until Phase 3 builds the real state machine (see docs/ROADMAP.md).
// Invariant already applies: this package stays pure — no I/O, time is injected.

export type TimerState = {
  status: 'idle'
}

export function createTimer(): TimerState {
  return { status: 'idle' }
}
