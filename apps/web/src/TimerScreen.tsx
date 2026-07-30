import {
  createTimer,
  derive,
  fiveOnFiveOff,
  formatClock,
  pause,
  reset,
  resume,
  skip,
  start,
  workPhaseProgress,
  type TimerState,
} from '@comptimer/timer-core'
import { useEffect, useState } from 'react'

const DEMO_PLAN = fiveOnFiveOff(4, 'Demo · 5 on / 5 off')

const COLORS = {
  work: { bg: '#07130b', accent: '#3ddc84', label: 'CLIMB' },
  rest: { bg: '#160b07', accent: '#ff7847', label: 'REST' },
} as const

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export function TimerScreen() {
  const [state, setState] = useState<TimerState>(() => createTimer(DEMO_PLAN))
  const now = useNow(100)
  const view = derive(state, now)

  const phaseKind = view.phase?.kind ?? 'work'
  const colors = COLORS[phaseKind]
  const progress = workPhaseProgress(state.plan, view.phaseIndex)
  const clock =
    state.plan.direction === 'down'
      ? formatClock(view.phaseRemainingMs)
      : formatClock(view.phaseElapsedMs, { mode: 'floor' })

  const running = view.status === 'running'

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
          {state.plan.title}
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
        {/* Temporary demo controls — the phone owns these from Phase 4 on */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {running ? (
            <DemoButton onClick={() => setState((s) => pause(s, Date.now()))}>
              Pause
            </DemoButton>
          ) : (
            <DemoButton
              onClick={() =>
                setState((s) =>
                  s.status === 'paused'
                    ? resume(s, Date.now())
                    : start(s, Date.now())
                )
              }
            >
              {state.status === 'paused' ? 'Resume' : 'Start'}
            </DemoButton>
          )}
          <DemoButton onClick={() => setState((s) => skip(s, Date.now()))}>
            Skip
          </DemoButton>
          <DemoButton onClick={() => setState((s) => reset(s))}>
            Reset
          </DemoButton>
        </div>
      </footer>
    </main>
  )
}

function DemoButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: '1.1rem',
        padding: '0.6rem 1.6rem',
        borderRadius: '0.5rem',
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(255,255,255,0.08)',
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}
