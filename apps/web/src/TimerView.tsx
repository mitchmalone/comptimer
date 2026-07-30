import {
  derive,
  formatClock,
  workPhaseProgress,
  type TimerState,
} from '@comptimer/timer-core'
import type { ReactNode } from 'react'

const COLORS = {
  work: { bg: '#07130b', accent: '#3ddc84' },
  rest: { bg: '#160b07', accent: '#ff7847' },
} as const

/** Presentational full-screen timer. State in, pixels out — no ownership. */
export function TimerView({
  state,
  nowMs,
  title,
  footer,
}: {
  state: TimerState
  nowMs: number
  title?: string
  footer?: ReactNode
}) {
  const view = derive(state, nowMs)
  const colors = COLORS[view.phase?.kind ?? 'work']
  const progress = workPhaseProgress(state.plan, view.phaseIndex)
  const clock =
    state.plan.direction === 'down'
      ? formatClock(view.phaseRemainingMs)
      : formatClock(view.phaseElapsedMs, { mode: 'floor' })

  return (
    <main
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        minHeight: '100vh',
        background: colors.bg,
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        transition: 'background 300ms',
      }}
    >
      <header style={{ padding: '2vh 0 0' }}>
        <div style={{ fontSize: '2.5vw', opacity: 0.7 }}>
          {title ?? state.plan.title}
        </div>
        <div
          style={{
            fontSize: '4vw',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: colors.accent,
          }}
        >
          {view.status === 'finished' ? 'FINISHED' : (view.phase?.label ?? '')}
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          fontSize: '26vw',
          fontWeight: 800,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {view.status === 'finished' ? formatClock(0) : clock}
      </div>

      <footer style={{ padding: '0 0 3vh' }}>
        <div style={{ fontSize: '3vw', opacity: 0.8, marginBottom: '2vh' }}>
          BOULDER {progress.current} / {progress.total}
        </div>
        {footer}
      </footer>
    </main>
  )
}
