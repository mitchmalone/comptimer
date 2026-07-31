export function DuoShowcase() {
  return (
    <>
      <section id='duo' className='duo-head'>
        <div className='section-head'>
          <h2>One clock, two screens.</h2>
          <span>The crowd sees one · the judge holds the other</span>
        </div>
      </section>

      <div className='duo'>
        {/* Display panel */}
        <div className='duo__panel duo__panel--display'>
          <div className='duo__badges'>
            <span className='badge badge--accent'>The display</span>
            <span className='badge badge--dim'>Any TV · any browser</span>
          </div>
          <div className='duo__stage'>
            <div className='phase-pill phase-pill--rest'>REST</div>
            <div className='mid-time'>0:52</div>
            <div className='screen__label'>NEXT: BOULDER 4 OF 8</div>
          </div>
          <div className='duo__caption duo__caption--display'>
            <h3>
              Crowd-sized
              <br />
              numbers
            </h3>
            <p>
              A timer that fills the screen, CLIMB / REST colours the whole gym
              parses at a glance, and your sponsors along the bottom.
            </p>
          </div>
        </div>

        {/* Controller panel */}
        <div className='duo__panel duo__panel--phone'>
          <div className='duo__badges'>
            <span className='badge badge--accent'>The controller</span>
            <span className='badge badge--dim'>iOS · in your pocket</span>
          </div>
          <div className='duo__stage duo__stage--phone'>
            <div className='phone'>
              <div className='phone__screen'>
                <div className='phase-pill phase-pill--rest'>REST</div>
                <div className='phone__time'>0:52</div>
                <div className='phone__next'>NEXT: BOULDER 4 OF 8</div>
              </div>
              <div className='phone__controls'>
                <div className='knob'>PAUSE</div>
                <div className='knob-row'>
                  <div className='pad-btn' />
                  <div className='pad-btn' />
                </div>
              </div>
            </div>
          </div>
          <div className='duo__caption duo__caption--phone'>
            <h3>
              Buttons that
              <br />
              feel like buttons
            </h3>
            <p>
              Big tactile controls a nervous volunteer can’t fumble. What you
              see up top is exactly what the crowd sees — pause, skip, mute,
              done.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
