import { describe, expect, it } from 'vitest'
import { DisplayCodeSchema } from './pairing'

describe('DisplayCodeSchema', () => {
  it('accepts a 6-char unambiguous code', () => {
    expect(DisplayCodeSchema.safeParse('AB2CD3').success).toBe(true)
  })

  it('rejects wrong length', () => {
    expect(DisplayCodeSchema.safeParse('AB2').success).toBe(false)
  })

  it('rejects ambiguous characters (0, O, 1, I) and lowercase', () => {
    expect(DisplayCodeSchema.safeParse('AB0CDE').success).toBe(false)
    expect(DisplayCodeSchema.safeParse('ab2cd3').success).toBe(false)
  })
})
