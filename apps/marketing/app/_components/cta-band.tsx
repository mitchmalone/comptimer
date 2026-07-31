import { links } from './site-links'

export function CtaBand() {
  return (
    <section id='cta' className='cta'>
      <div className='cta__title'>
        Your next comp starts with <span className='accent'>a scan.</span>
      </div>
      <div className='cta__actions'>
        <a href={links.ios} className='btn btn-primary'>
          Get the iOS app →
        </a>
        <a href={links.display} className='btn btn-ghost'>
          app.comptimer.com
        </a>
      </div>
      <div className='cta__fine'>
        FREE WHILE IN BETA · NO ACCOUNTS · PAIRS IN SECONDS
      </div>
    </section>
  )
}
