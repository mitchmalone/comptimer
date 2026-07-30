import type { SessionState } from '@comptimer/contracts'
import type { ConnectionStatus } from '@comptimer/transport'
import { useEffect, useMemo, useState } from 'react'
import { PairScreen } from './PairScreen'
import { TimerView } from './TimerView'
import { getDisplayTransport } from './transport'
import { useNow } from './useNow'

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
    transport.fetchSession(sessionId).then((s) => {
      if (s) setSession(s)
    })
    return transport.subscribeSession(sessionId, setSession, setConnection)
  }, [transport, sessionId])

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
    <div style={{ position: 'relative' }}>
      <TimerView state={session.timer} nowMs={now} title={session.title} />
      <ConnectionDot status={connection} />
      <button
        onClick={unpair}
        title='Unpair this display'
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.25)',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
      >
        ✕
      </button>
    </div>
  )
}

function ConnectionDot({ status }: { status: ConnectionStatus }) {
  const color =
    status === 'connected'
      ? '#3ddc84'
      : status === 'connecting'
        ? '#e8c547'
        : '#ff5a5a'
  return (
    <div
      title={`Realtime: ${status} — the clock keeps running locally either way`}
      style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        width: '0.75rem',
        height: '0.75rem',
        borderRadius: '50%',
        background: color,
        opacity: 0.8,
      }}
    />
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        background: '#0b0b0f',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '1.5rem',
        opacity: 0.85,
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      {children}
    </main>
  )
}
