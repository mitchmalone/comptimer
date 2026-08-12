'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

function current(): Theme {
  const t = document.documentElement.getAttribute('data-theme')
  return t === 'light' ? 'light' : 'dark'
}

/**
 * Flips `data-theme` on <html> and persists the choice. The initial theme is
 * set pre-paint by the inline script in layout.tsx, so this only reflects and
 * mutates that state — no flash on load.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setTheme(current())
  }, [])

  function toggle() {
    const next: Theme = current() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('ct-theme', next)
    } catch {
      // ignore — private mode / storage disabled
    }
    setTheme(next)
  }

  return (
    <button
      type='button'
      className='nav__toggle'
      onClick={toggle}
      title='Switch light/dark mode'
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
