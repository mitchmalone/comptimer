import {
  createTimer,
  derive,
  fiveOnFiveOff,
  pause,
  reset,
  resume,
  skip,
  start,
  type TimerState,
} from '@comptimer/timer-core'
import { useState } from 'react'
import { SoundToggle } from './SoundToggle'
import { TimerView } from './TimerView'
import { useNow } from './useNow'
import { useSoundCues } from './useSoundCues'

const DEMO_PLAN = fiveOnFiveOff(4, 'Demo · 5 on / 5 off')

/** Local-only demo (#demo). Real sessions are driven from the phone. */
export function DemoScreen() {
  const [state, setState] = useState<TimerState>(() => createTimer(DEMO_PLAN))
  const now = useNow(100)
  const { soundOn, toggleSound } = useSoundCues(derive(state, now))
  const running = state.status === 'running'

  return (
    <TimerView
      state={state}
      nowMs={now}
      cornerControls={<SoundToggle on={soundOn} onToggle={toggleSound} />}
      footer={
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
          <DemoButton onClick={() => setState(reset)}>Reset</DemoButton>
        </div>
      }
    />
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
