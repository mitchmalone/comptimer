import { useEffect, useState } from 'react'
import { PairScreen } from './PairScreen'
import { TimerScreen } from './TimerScreen'

// Hash-based switching is all the routing this app needs for now:
// default = demo timer, #pair = pairing scaffold.
export function App() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return hash === '#pair' ? <PairScreen /> : <TimerScreen />
}
