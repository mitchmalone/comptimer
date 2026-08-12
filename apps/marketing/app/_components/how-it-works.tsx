const STEPS = [
  {
    num: '01',
    title: 'Open the display.',
    body: 'Load the web app on any TV, projector or monitor with a browser. It puts up a QR code and a session code — that’s the whole setup.',
  },
  {
    num: '02',
    title: 'Scan with your phone.',
    body: 'The iOS app links straight to the display over a live connection. No logins, no pairing menus, no cables across the gym floor.',
  },
  {
    num: '03',
    title: 'Run the clock.',
    body: 'Pick a format and hit start. Pause, skip rotations and mute the horn from your pocket — the big screen follows instantly.',
  },
]

export function HowItWorks() {
  return (
    <>
      <section id='how' className='how'>
        <div className='section-head'>
          <h2>On the wall in three moves.</h2>
          <span>TV → phone → start</span>
        </div>
      </section>
      <div className='cards cards--3'>
        {STEPS.map((s) => (
          <div className='card' key={s.num}>
            <div className='card__num'>{s.num}</div>
            <div className='card__title'>{s.title}</div>
            <p>{s.body}</p>
          </div>
        ))}
      </div>
    </>
  )
}
