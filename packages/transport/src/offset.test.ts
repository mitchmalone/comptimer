import { describe, expect, it } from 'vitest'
import { computeOffsetMs } from './offset'

describe('computeOffsetMs', () => {
  it('is zero when clocks agree and the trip is symmetric', () => {
    expect(computeOffsetMs(1000, 1200, 1100)).toBe(0)
  })

  it('is positive when the server clock is ahead', () => {
    expect(computeOffsetMs(1000, 1200, 1600)).toBe(500)
  })

  it('is negative when the local clock is ahead', () => {
    expect(computeOffsetMs(5000, 5200, 4100)).toBe(-1000)
  })
})
