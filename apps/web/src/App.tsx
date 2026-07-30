import { useEffect, useState } from 'react'
import { DemoScreen } from './DemoScreen'
import { DisplayApp } from './DisplayApp'

// Default = the real display (pair, then render the phone-driven session).
// #demo keeps the local self-driving timer for development and demos.
export function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return hash === '#demo' ? <DemoScreen /> : <DisplayApp />
}
