import { ThemeToggle } from './theme-toggle'
import { links } from './site-links'

export function SiteHeader() {
  return (
    <header className='header' id='top'>
      <a href='#top' className='brand'>
        <div className='brand__mark'>
          <span>:05</span>
        </div>
        <span className='brand__name'>COMP TIMER</span>
      </a>
      <nav className='nav'>
        <span className='nav__links'>
          <a href='#how' className='nav__link'>
            How it works
          </a>
          <a href='#duo' className='nav__link'>
            Display + Phone
          </a>
          <a href='#formats' className='nav__link'>
            Formats
          </a>
        </span>
        <ThemeToggle />
        <a href={links.ios} className='nav__cta'>
          Get the app
        </a>
      </nav>
    </header>
  )
}
