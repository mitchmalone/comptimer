import { describe, expect, it } from 'vitest'
import { createTimer } from './timer'

describe('createTimer', () => {
  it('starts idle', () => {
    expect(createTimer()).toEqual({ status: 'idle' })
  })
})
