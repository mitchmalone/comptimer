import { detectCues, type TimerView } from '@comptimer/timer-core'
import { useEffect, useRef, useState } from 'react'
import { SoundEngine } from './sound'

const SOUND_KEY = 'comptimer.sound'
const engine = new SoundEngine()

/**
 * Plays audible cues for a live timer view. Sound stays off until the user
 * taps the toggle at least once per page load (browser autoplay policy) —
 * the stored preference only controls the toggle's initial intent.
 */
export function useSoundCues(view: TimerView): {
  soundOn: boolean
  toggleSound: () => void
} {
  const [soundOn, setSoundOn] = useState(false)
  const prevRef = useRef<TimerView>(view)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = view
    if (!soundOn) return
    for (const cue of detectCues(prev, view)) engine.play(cue)
  }, [view, soundOn])

  const toggleSound = () => {
    setSoundOn((on) => {
      const next = !on
      if (next) engine.unlock()
      localStorage.setItem(SOUND_KEY, String(next))
      return next
    })
  }

  return { soundOn, toggleSound }
}

export function soundPreferred(): boolean {
  return localStorage.getItem(SOUND_KEY) === 'true'
}
