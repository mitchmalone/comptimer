import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { D } from './theme'

const STEPS = [
  'Open Comp Timer on your phone',
  'Scan this code to link the display',
  'Pick a format and start the clock',
]

/** Shown until a phone claims this display's code (mockup W1). */
export function PairScreen({ code }: { code: string }) {
  const [qr, setQr] = useState<string | null>(null)

  useEffect(() => {
    // QR carries the bare code — the app reads it wherever it's pointed.
    QRCode.toDataURL(code, {
      width: 640,
      margin: 1,
      color: { dark: '#0b1013', light: '#ffffff' },
    })
      .then(setQr)
      .catch(() => setQr(null))
  }, [code])

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: D.scrBg,
        color: D.text,
        fontFamily: D.sans,
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(40px, 8vw, 120px)',
          flexWrap: 'wrap',
          padding: '4vh 6vw',
        }}
      >
        {/* Left — brand, headline, steps */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(18px, 2.4vh, 30px)',
            maxWidth: 460,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 'clamp(11px, 1vw, 16px)',
                height: 'clamp(11px, 1vw, 16px)',
                background: D.accent,
                borderRadius: 3,
              }}
            />
            <span
              style={{
                fontWeight: 900,
                fontSize: 'clamp(16px, 1.6vw, 24px)',
                letterSpacing: '0.06em',
              }}
            >
              COMP TIMER
            </span>
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 'clamp(34px, 4.4vw, 68px)',
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
            }}
          >
            Scan to take control<span style={{ color: D.accent }}>.</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'clamp(12px, 1.6vh, 18px)',
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={i}
                style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}
              >
                <span
                  style={{
                    fontFamily: D.mono,
                    fontWeight: 700,
                    fontSize: 'clamp(13px, 1vw, 18px)',
                    color: D.accent,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: 'clamp(15px, 1.35vw, 22px)',
                    color: D.sub,
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — QR card + code */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(14px, 2vh, 20px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: 'clamp(14px, 1.4vw, 22px)',
              borderRadius: 14,
              boxShadow: `0 0 0 1px ${D.line}, 0 10px 30px rgba(0,0,0,.35)`,
              lineHeight: 0,
            }}
          >
            {qr ? (
              <img
                src={qr}
                alt={`Pairing code ${code}`}
                style={{
                  width: 'clamp(200px, 22vw, 340px)',
                  height: 'clamp(200px, 22vw, 340px)',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: 'clamp(200px, 22vw, 340px)',
                  height: 'clamp(200px, 22vw, 340px)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#0b1013',
                  fontFamily: D.mono,
                }}
              >
                …
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                fontWeight: 600,
                fontSize: 'clamp(13px, 1vw, 16px)',
                color: D.sub,
              }}
            >
              or enter code
            </span>
            <span
              style={{
                fontFamily: D.mono,
                fontWeight: 700,
                fontSize: 'clamp(18px, 1.6vw, 24px)',
                letterSpacing: '0.18em',
                background: D.chip,
                border: `1px solid ${D.line}`,
                borderRadius: 8,
                padding: '6px 14px',
              }}
            >
              {formatCode(code)}
            </span>
          </div>
        </div>
      </div>

      {/* Waiting bar */}
      <div
        style={{
          height: 'clamp(48px, 7vh, 64px)',
          borderTop: `1px solid ${D.line}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: D.amber,
          }}
        />
        <span
          style={{
            fontFamily: D.mono,
            fontWeight: 600,
            fontSize: 'clamp(12px, 1vw, 15px)',
            letterSpacing: '0.1em',
            color: D.sub,
          }}
        >
          WAITING FOR CONTROLLER…
        </span>
      </div>
    </main>
  )
}

/** Group as XXX-XXX for readability (codes are 6 chars). */
function formatCode(code: string): string {
  return code.length === 6 ? `${code.slice(0, 3)}-${code.slice(3)}` : code
}
