const PILLS = [
  'Count down.',
  'Count up.',
  'Rotations.',
  'Rest periods.',
  'Horns.',
  '1-min warnings.',
  'Sponsor strip.',
  'QR pairing.',
  'Light + dark.',
  'Custom formats.',
]

export function FeaturePills() {
  return (
    <section className='glance'>
      <div className='glance__title'>The judging table, sorted.</div>
      <p className='glance__lede'>
        The timer is the headline, but it’s not the whole story.
      </p>
      <div className='pills'>
        {PILLS.map((p) => (
          <span className='pill' key={p}>
            {p}
          </span>
        ))}
      </div>
    </section>
  )
}
