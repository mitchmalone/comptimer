import { useMemo } from 'react'

// Unambiguous alphabet (no 0/O, 1/I) — mirrors contracts' DisplayCodeSchema.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateDisplayCode(): string {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (b) => ALPHABET[b % ALPHABET.length]
  ).join('')
}

/**
 * Scaffold only: shows the code a phone will claim in Phase 4. The QR and the
 * realtime channel arrive with the transport work.
 */
export function PairScreen() {
  const code = useMemo(generateDisplayCode, [])

  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        background: '#0b0b0f',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      <div>
        <div
          style={{
            width: '20rem',
            height: '20rem',
            margin: '0 auto 3vh',
            display: 'grid',
            placeItems: 'center',
            border: '2px dashed rgba(255,255,255,0.3)',
            borderRadius: '1rem',
            fontSize: '1rem',
            opacity: 0.6,
          }}
        >
          QR — Phase 4
        </div>
        <div
          style={{
            fontSize: '4rem',
            fontWeight: 800,
            letterSpacing: '0.35em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {code}
        </div>
        <p style={{ opacity: 0.7, fontSize: '1.2rem' }}>
          Scan with the CompTimer app to take control of this display
        </p>
      </div>
    </main>
  )
}
