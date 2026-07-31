const ITEMS = [
  'Pairs in seconds',
  'No accounts, no cables',
  '5 on / 5 off · 4+0 · Lead · Open session',
  'Works on any TV with a browser',
]

export function Marquee() {
  // Duplicated once so the -50% translate loops seamlessly.
  const loop = [...ITEMS, ...ITEMS]
  return (
    <div className='marquee' aria-hidden='true'>
      <div className='marquee__track'>
        {loop.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex' }}>
            <span className='marquee__item'>{item}</span>
            <span>✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
