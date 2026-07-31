import { links } from './site-links'

export function SiteFooter() {
  return (
    <footer className='footer'>
      <div className='footer__grid'>
        <div className='footer__brand'>
          <div className='brand' style={{ marginBottom: 18 }}>
            <div className='brand__mark'>
              <span>:05</span>
            </div>
            <span className='brand__name' style={{ fontSize: 20 }}>
              COMP TIMER
            </span>
          </div>
          <p>
            Big-screen timing for climbing comps. Built by people who’ve run the
            stopwatch-and-megaphone version.
          </p>
          <div className='footer__social'>
            <a href={links.instagram}>Instagram</a>
            <a href={`mailto:${links.email}`}>{links.email}</a>
          </div>
        </div>

        <div className='footer__col'>
          <h4>Product</h4>
          <a href='#how'>How it works</a>
          <a href='#duo'>Display + phone</a>
          <a href='#formats'>Formats</a>
        </div>

        <div className='footer__col'>
          <h4>Get started</h4>
          <a href={links.ios}>iOS app</a>
          <a href={links.display}>Open a display</a>
          <a href={links.display}>Run a demo session</a>
        </div>

        <div className='footer__col'>
          <h4>Support</h4>
          <a href='#top'>Setup guide</a>
          <a href='#top'>Venue checklist</a>
          <a href='#top'>Privacy</a>
        </div>
      </div>
      <div className='footer__legal'>© 2026 Comp Timer</div>
    </footer>
  )
}
