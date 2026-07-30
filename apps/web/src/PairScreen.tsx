import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/** Shown until a phone claims this display's code. */
export function PairScreen({ code }: { code: string }) {
  const [qr, setQr] = useState<string | null>(null)

  useEffect(() => {
    // QR carries the bare code — the app reads it wherever it's pointed.
    QRCode.toDataURL(code, {
      width: 640,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(setQr)
      .catch(() => setQr(null))
  }, [code])

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
        {qr ? (
          <img
            src={qr}
            alt={`Pairing code ${code}`}
            style={{
              width: '20rem',
              height: '20rem',
              borderRadius: '1rem',
              marginBottom: '3vh',
            }}
          />
        ) : (
          <div
            style={{
              width: '20rem',
              height: '20rem',
              margin: '0 auto 3vh',
              display: 'grid',
              placeItems: 'center',
              border: '2px dashed rgba(255,255,255,0.3)',
              borderRadius: '1rem',
              opacity: 0.6,
            }}
          >
            …
          </div>
        )}
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
          Enter this code in the CompTimer app to take control of this display
        </p>
      </div>
    </main>
  )
}
