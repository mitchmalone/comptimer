const FORMATS = [
  {
    title: 'World Cup Boulder.',
    spec: '5:00 ON · 5:00 OFF',
    body: 'Rotating stations, horn on the change, one-minute warning built in.',
  },
  {
    title: 'Boulder 4+0.',
    spec: '4:00 CONTINUOUS',
    body: 'No rest, straight through — the modern festival-round favourite.',
  },
  {
    title: 'Lead attempt.',
    spec: '6:00 ONE-SHOT',
    body: 'One climber, one rope, six minutes. Reset between athletes in a tap.',
  },
  {
    title: 'Open session.',
    spec: '3:00:00 WINDOW',
    body: 'A whole comp window counting down while everyone climbs at once.',
  },
]

export function Formats() {
  return (
    <>
      <section id='formats' className='formats-head'>
        <div className='section-head'>
          <h2>Climbing first. More sports next.</h2>
          <span>Templates, or roll your own</span>
        </div>
      </section>
      <div className='formats'>
        {FORMATS.map((f) => (
          <div className='fmt' key={f.title}>
            <div className='fmt__title'>{f.title}</div>
            <div className='fmt__spec'>{f.spec}</div>
            <p>{f.body}</p>
          </div>
        ))}
        <div className='fmt fmt--custom'>
          <div className='fmt__title'>Custom.</div>
          <div className='fmt__spec'>YOUR RULES</div>
          <p>
            Any periods, durations and rests. Soccer and basketball packs are on
            the way.
          </p>
        </div>
      </div>
    </>
  )
}
