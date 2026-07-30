import type { CueEvent } from '@comptimer/timer-core'

/**
 * WebAudio tone generator — no audio assets, nothing to load or cache.
 * The context starts suspended by autoplay policy; unlock() must be called
 * from a user gesture before anything is audible.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null

  unlock(): void {
    this.ctx ??= new AudioContext()
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  get unlocked(): boolean {
    return this.ctx?.state === 'running'
  }

  play(cue: CueEvent): void {
    switch (cue) {
      case 'countdownTick':
        this.tone(880, 0.12)
        break
      case 'oneMinuteWarning':
        this.tone(660, 0.15)
        this.tone(660, 0.15, 0.25)
        break
      case 'phaseChange':
        this.tone(440, 0.7)
        break
      case 'finish':
        this.tone(440, 0.35)
        this.tone(330, 0.9, 0.4)
        break
    }
  }

  private tone(freq: number, durationS: number, delayS = 0): void {
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running') return
    const start = ctx.currentTime + delayS
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = freq
    // Envelope avoids clicks at the edges of the square wave.
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.3, start + 0.02)
    gain.gain.setValueAtTime(0.3, start + durationS - 0.03)
    gain.gain.linearRampToValueAtTime(0, start + durationS)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + durationS + 0.01)
  }
}
