import { useEffect, useState } from 'react'

export function useNow(intervalMs: number, offsetMs = 0): number {
  const [now, setNow] = useState(() => Date.now() + offsetMs)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + offsetMs), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, offsetMs])
  return now
}
