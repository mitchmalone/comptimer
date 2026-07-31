import type { SessionState } from '@comptimer/contracts'
import {
  derive,
  formatClock,
  workPhaseProgress,
  type TimerState,
} from '@comptimer/timer-core'
import type { ReactNode } from 'react'
import { D } from './theme'

const FINAL_SECONDS_MS = 5_000
const MAX_SQUARES = 12

/**
 * Presentational full-screen timer (mockup W2). State in, pixels out — no
 * ownership. The stage stays charcoal; the phase reads from the state pill
 * (CLIMB cyan / REST + PAUSED amber), never a full-screen colour flip.
 */
export function TimerView({
  state,
  nowMs,
  title,
  logos,
  organizerLogoUrl,
  headerRight,
  footer,
  cornerControls,
}: {
  state: TimerState
  nowMs: number
  title?: string
  logos?: SessionState['logos']
  organizerLogoUrl?: string
  headerRight?: ReactNode
  footer?: ReactNode
  cornerControls?: ReactNode
}) {
  const view = derive(state, nowMs)
  const kind = view.phase?.kind ?? 'work'
  const progress = workPhaseProgress(state.plan, view.phaseIndex)
  const finalSeconds =
    view.status === 'running' && view.phaseRemainingMs <= FINAL_SECONDS_MS
  const clock =
    state.plan.direction === 'down'
      ? formatClock(view.phaseRemainingMs)
      : formatClock(view.phaseElapsedMs, { mode: 'floor' })

  const pill = (() => {
    if (view.status === 'finished')
      return { label: 'FINISHED', bg: D.sub, ink: D.scrBg }
    if (view.status === 'paused')
      return { label: 'PAUSED', bg: D.amber, ink: D.amberInk }
    const label =
      (view.phase?.label ?? '').toUpperCase() ||
      (kind === 'rest' ? 'REST' : 'CLIMB')
    return kind === 'rest'
      ? { label, bg: D.amber, ink: D.amberInk }
      : { label, bg: D.accent, ink: D.accentInk }
  })()

  const indicator =
    view.status === 'finished'
      ? 'SESSION COMPLETE'
      : kind === 'rest'
        ? `NEXT · BOULDER ${Math.min(progress.current + 1, progress.total)} OF ${progress.total}`
        : `BOULDER ${Math.min(progress.current, progress.total)} OF ${progress.total}`

  const showSquares = progress.total >= 2 && progress.total <= MAX_SQUARES
  const filled = view.status === 'finished' ? progress.total : progress.current
  const heading = title ?? state.plan.title

  return (
    <main
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: '100vh',
        background: D.scrBg,
        color: D.text,
        fontFamily: D.sans,
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          height: 'clamp(56px, 9vh, 96px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2vw',
          padding: '0 3vw',
          borderBottom: `1px solid ${D.line}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
          {organizerLogoUrl ? (
            <img
              src={organizerLogoUrl}
              alt=''
              style={{ height: '4vh', objectFit: 'contain' }}
            />
          ) : null}
          {heading ? (
            <span
              style={{
                fontWeight: 800,
                fontSize: 'clamp(14px, 1.5vw, 30px)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: D.text,
              }}
            >
              {heading}
            </span>
          ) : null}
        </div>
        <div style={{ flex: 'none' }}>{headerRight}</div>
      </header>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.4vh',
          minHeight: 0,
        }}
      >
        <div
          style={{
            background: pill.bg,
            color: pill.ink,
            borderRadius: 999,
            padding: 'clamp(4px, 0.7vh, 12px) clamp(16px, 2vw, 40px)',
            fontWeight: 900,
            fontSize: 'clamp(16px, 2vw, 40px)',
            letterSpacing: '0.18em',
            lineHeight: 1.1,
          }}
        >
          {pill.label}
        </div>

        <div
          style={{
            fontFamily: D.mono,
            fontWeight: 700,
            fontSize: 'min(23vw, 46vh)',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            fontVariantNumeric: 'tabular-nums',
            color: finalSeconds ? D.danger : D.text,
            transition: 'color 200ms',
          }}
        >
          {view.status === 'finished' ? formatClock(0) : clock}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.4vw',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: 'clamp(12px, 1.1vw, 22px)',
              letterSpacing: '0.14em',
              color: D.sub,
            }}
          >
            {indicator}
          </span>
          {showSquares ? (
            <div style={{ display: 'flex', gap: 'clamp(4px, 0.4vw, 7px)' }}>
              {Array.from({ length: progress.total }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 'clamp(9px, 0.7vw, 14px)',
                    height: 'clamp(9px, 0.7vw, 14px)',
                    borderRadius: 3,
                    background: i < filled ? D.accent : D.chip,
                    border: i < filled ? 'none' : `1px solid ${D.line}`,
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {footer ? (
        <footer style={{ padding: '2vh 3vw' }}>{footer}</footer>
      ) : logos?.length ? (
        <SponsorStrip logos={logos} />
      ) : null}

      {cornerControls}
    </main>
  )
}

function SponsorStrip({
  logos,
}: {
  logos: NonNullable<SessionState['logos']>
}) {
  return (
    <footer
      style={{
        height: 'clamp(64px, 12vh, 120px)',
        borderTop: `1px solid ${D.line}`,
        display: 'flex',
        alignItems: 'center',
        gap: '2.5vw',
        padding: '0 3vw',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          flex: 'none',
          fontFamily: D.mono,
          fontWeight: 600,
          fontSize: 'clamp(9px, 0.7vw, 13px)',
          letterSpacing: '0.14em',
          color: D.sub,
        }}
      >
        PRESENTED BY
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2.5vw',
          minWidth: 0,
        }}
      >
        {logos.map((logo) => (
          <img
            key={logo.url}
            src={logo.url}
            alt={logo.alt ?? ''}
            style={{ height: '6vh', maxHeight: 64, objectFit: 'contain' }}
          />
        ))}
      </div>
    </footer>
  )
}
