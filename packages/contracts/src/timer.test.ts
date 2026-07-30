import { createTimer, fiveOnFiveOff, start } from '@comptimer/timer-core'
import { describe, expect, it } from 'vitest'
import { SessionStateSchema } from './session'
import { TimerStateSchema } from './timer'

describe('TimerStateSchema', () => {
  it('round-trips a real timer-core state', () => {
    const state = start(
      createTimer(fiveOnFiveOff(4, 'Quali A')),
      1_700_000_000_000
    )
    const parsed = TimerStateSchema.parse(JSON.parse(JSON.stringify(state)))
    expect(parsed).toEqual(state)
  })

  it('rejects an unknown status', () => {
    const state = createTimer(fiveOnFiveOff(2))
    const mangled = { ...state, status: 'exploded' }
    expect(TimerStateSchema.safeParse(mangled).success).toBe(false)
  })
})

describe('SessionStateSchema', () => {
  it('accepts a full session payload', () => {
    const session = {
      id: 'f81d4fae-7dec-41d0-a765-00a0c91e6bf6',
      title: 'Bouldering Finals',
      timer: createTimer(fiveOnFiveOff(4)),
      updatedAtMs: 1_700_000_000_000,
    }
    expect(SessionStateSchema.safeParse(session).success).toBe(true)
  })

  it('rejects a non-uuid id', () => {
    const session = {
      id: 'nope',
      timer: createTimer(fiveOnFiveOff(4)),
      updatedAtMs: 1,
    }
    expect(SessionStateSchema.safeParse(session).success).toBe(false)
  })
})
