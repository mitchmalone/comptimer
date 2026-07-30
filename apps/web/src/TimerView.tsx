import type { SessionState } from '@comptimer/contracts'
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

const FINAL_SECONDS_MS = 5_000

/** Presentational full-screen timer. State in, pixels out — no ownership. */
export function TimerView({
  state,
  nowMs,
  title,
  logos,
  organizerLogoUrl,
  footer,
  cornerControls,
}: {
  state: TimerState
  nowMs: number
  title?: string
  logos?: SessionState['logos']
  organizerLogoUrl?: string
  footer?: ReactNode
  cornerControls?: ReactNode
}) {
  const view = derive(state, nowMs)
  const colors = COLORS[view.phase?.kind ?? 'work']
  const progress = workPhaseProgress(state.plan, view.phaseIndex)
  const finalSeconds =
    view.status === 'running' && view.phaseRemainingMs <= FINAL_SECONDS_MS
  const clock =
    state.plan.direction === 'down'
      ? formatClock(view.phaseRemainingMs)
      : formatClock(view.phaseElapsedMs, { mode: 'floor' })
  const phaseFraction = view.phase
    ? Math.min(1, view.phaseElapsedMs / view.phase.durationMs)
    : 0

  const indicator =
    view.status === 'finished'
      ? 'DONE'
      : view.phase?.kind === 'rest'
        ? `NEXT · BOULDER ${Math.min(progress.current + 1, progress.total)} / ${progress.total}`
        : `BOULDER ${progress.current} / ${progress.total}`

  return (
    <main
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        minHeight: '100vh',
        background: colors.bg,
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        transition: 'background 300ms',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          padding: '2vh 0 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1vw',
            fontSize: '2.5vw',
            opacity: 0.7,
          }}
        >
          {organizerLogoUrl ? (
            <img
              src={organizerLogoUrl}
              alt=''
              style={{ height: '3.5vw', objectFit: 'contain' }}
            />
          ) : null}
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
          color: finalSeconds ? '#ff5a5a' : '#fff',
          transition: 'color 200ms',
        }}
      >
        {view.status === 'finished' ? formatClock(0) : clock}
      </div>

      <footer style={{ padding: '0 0 2vh' }}>
        <div style={{ fontSize: '3vw', opacity: 0.8, marginBottom: '1.5vh' }}>
          {indicator}
        </div>
        {logos?.length ? (
          <div
            style={{
              display: 'flex',
              gap: '3vw',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1.5vh',
            }}
          >
            {logos.map((logo) => (
              <img
                key={logo.url}
                src={logo.url}
                alt={logo.alt ?? ''}
                style={{ height: '4vh', objectFit: 'contain', opacity: 0.85 }}
              />
            ))}
          </div>
        ) : null}
        {footer}
      </footer>

      {/* Phase progress — a thin strip pinned to the very bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '0.6vh',
          width: `${phaseFraction * 100}%`,
          background: colors.accent,
          opacity: 0.9,
          transition: 'width 120ms linear',
        }}
      />

      {cornerControls}
    </main>
  )
}
