import { links } from './site-links'

export function Hero() {
  return (
    <section className='hero'>
      <h1 className='hero__title'>
        Every second, seen All the way{' '}
        <span className='accent'>to the back row.</span>
      </h1>
      <div className='hero__row'>
        <p className='hero__lede'>
          The comp clock for climbing gyms. Throw the display on any TV, scan
          the QR code with your phone, and run 5-on / 5-off rotations from the
          judging table.
        </p>
        <div className='hero__actions'>
          <a href={links.ios} className='btn btn-primary'>
            Get the iOS app →
          </a>
          <a href='#duo' className='btn btn-ghost'>
            Open a display →
          </a>
        </div>
      </div>

      <div className='screen' aria-label='Display preview'>
        <div className='screen__bar'>
          <div className='screen__title'>OPEN A WOMENS FINAL</div>
          <div className='screen__meta'>
            <div className='screen__tag'>SOUND ON</div>
            <div className='screen__tag'>
              <span className='dot' />
              LINKED
            </div>
          </div>
        </div>
        <div className='screen__body'>
          <div className='phase-pill phase-pill--climb'>CLIMB</div>
          <div className='big-time'>3:47</div>
          <div className='screen__label'>BOULDER 3 OF 8</div>
        </div>
        <div className='screen__sponsors'>
          <div className='label'>PRESENTED BY</div>
          <div className='sponsor-slot' />
          <div className='sponsor-slot' />
          <div className='sponsor-slot' />
          <div className='sponsor-slot' />
        </div>
      </div>
    </section>
  )
}
