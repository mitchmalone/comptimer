export function SoundToggle({
  on,
  onToggle,
}: {
  on: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      title={on ? 'Sound on' : 'Tap to enable sound'}
      style={{
        position: 'absolute',
        bottom: '1.2rem',
        left: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '0.5rem',
        color: on ? '#fff' : 'rgba(255,255,255,0.55)',
        padding: '0.4rem 0.8rem',
        fontSize: '1rem',
        cursor: 'pointer',
      }}
    >
      {on ? '🔊' : '🔇'}
      {!on && <span style={{ fontSize: '0.85rem' }}>enable sound</span>}
    </button>
  )
}
