import type { SessionState } from '@comptimer/contracts'
import { derive } from '@comptimer/timer-core'
import type { ConnectionStatus } from '@comptimer/transport'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PairScreen } from './PairScreen'
import { TimerView } from './TimerView'
import { getDisplayTransport } from './transport'
import { useNow } from './useNow'
import { useSoundCues } from './useSoundCues'
import { D } from './theme'

const SESSION_KEY = 'comptimer.sessionId'
// Unambiguous alphabet (no 0/O, 1/I) — mirrors contracts' DisplayCodeSchema.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateDisplayCode(): string {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (b) => ALPHABET[b % ALPHABET.length]
  ).join('')
}

export function DisplayApp() {
  const transport = getDisplayTransport()
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY)
  )
  const [session, setSession] = useState<SessionState | null>(null)
  const [connection, setConnection] = useState<ConnectionStatus>('connecting')
  const [offsetMs, setOffsetMs] = useState(0)
  const code = useMemo(generateDisplayCode, [])
  const now = useNow(100, offsetMs)
  const lastConnection = useRef<ConnectionStatus>('connecting')

  useEffect(() => {
    if (!transport) return
    transport.estimateServerOffsetMs().then(setOffsetMs, () => {})
  }, [transport])

  // Pairing: listen until a phone claims this code.
  useEffect(() => {
    if (!transport || sessionId) return
    return transport.waitForClaim(code, (id) => {
      localStorage.setItem(SESSION_KEY, id)
      setSessionId(id)
    })
  }, [transport, sessionId, code])

  // Session: rehydrate from the durable row, then follow live broadcasts.
  useEffect(() => {
    if (!transport || !sessionId) return
    const refetch = () =>
      transport.fetchSession(sessionId).then((s) => {
        if (s) setSession(s)
      })
    refetch()
    // Broadcasts missed while disconnected or backgrounded are gone — the
    // durable row is the recovery path, so refetch on both edges.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refetch()
    }
    document.addEventListener('visibilitychange', onVisible)
    const unsubscribe = transport.subscribeSession(
      sessionId,
      setSession,
      (status) => {
        if (lastConnection.current === 'disconnected' && status === 'connected')
          void refetch()
        lastConnection.current = status
        setConnection(status)
      }
    )
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      unsubscribe()
    }
  }, [transport, sessionId])

  const view = session ? derive(session.timer, now) : null
  const { soundOn, toggleSound } = useSoundCues(
    view ?? {
      status: 'idle',
      phaseIndex: 0,
      phase: null,
      phaseRemainingMs: 0,
      phaseElapsedMs: 0,
    }
  )

  const unpair = () => {
    localStorage.removeItem(SESSION_KEY)
    setSessionId(null)
    setSession(null)
    window.location.reload()
  }

  if (!transport) {
    return (
      <Centered>
        Display not configured — missing VITE_SUPABASE_URL /
        VITE_SUPABASE_ANON_KEY.
      </Centered>
    )
  }

  if (!sessionId) return <PairScreen code={code} />
  if (!session) return <Centered>Waiting for session…</Centered>

  return (
    <TimerView
      state={session.timer}
      nowMs={now}
      title={session.title}
      logos={session.logos}
      organizerLogoUrl={session.organizerLogoUrl}
      headerRight={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(14px, 1.6vw, 26px)',
          }}
        >
          <SoundStatus on={soundOn} onToggle={toggleSound} />
          <ConnectionStatus status={connection} />
        </div>
      }
      cornerControls={<UnpairButton onClick={unpair} />}
    />
  )
}

function statusLabelStyle(color: string): React.CSSProperties {
  return {
    fontFamily: D.mono,
    fontWeight: 600,
    fontSize: 'clamp(10px, 0.85vw, 13px)',
    letterSpacing: '0.12em',
    color,
  }
}

function SoundStatus({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const color = on ? D.sub : D.amber
  const size = 'clamp(14px, 1.1vw, 18px)'
  return (
    <button
      onClick={onToggle}
      title={on ? 'Sound on' : 'Tap to enable sound'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <svg
        viewBox='0 0 24 24'
        width={size}
        height={size}
        fill='none'
        stroke={color}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z' />
        {on ? (
          <>
            <path d='M16 9a5 5 0 0 1 0 6' />
            <path d='M19.364 18.364a9 9 0 0 0 0-12.728' />
          </>
        ) : (
          <>
            <line x1='22' x2='16' y1='9' y2='15' />
            <line x1='16' x2='22' y1='9' y2='15' />
          </>
        )}
      </svg>
      <span style={statusLabelStyle(color)}>
        {on ? 'SOUND ON' : 'TAP FOR SOUND'}
      </span>
    </button>
  )
}

function ConnectionStatus({ status }: { status: ConnectionStatus }) {
  const map: Record<ConnectionStatus, { color: string; label: string }> = {
    connected: { color: D.live, label: 'LINKED' },
    connecting: { color: D.amber, label: 'CONNECTING…' },
    disconnected: { color: D.danger, label: 'RECONNECTING…' },
  }
  const { color, label } = map[status]
  return (
    <div
      title={`Realtime: ${status} — the clock keeps running locally either way`}
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
        }}
      />
      <span style={statusLabelStyle(D.sub)}>{label}</span>
    </div>
  )
}

function UnpairButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title='Unpair this display'
      style={{
        position: 'absolute',
        bottom: '1.4vh',
        right: '1.2vw',
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.18)',
        fontSize: '1rem',
        lineHeight: 1,
        cursor: 'pointer',
      }}
    >
      ✕
    </button>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        height: '100vh',
        background: D.scrBg,
        color: D.sub,
        fontFamily: D.sans,
        fontSize: 'clamp(16px, 1.5vw, 24px)',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {children}
    </main>
  )
}
