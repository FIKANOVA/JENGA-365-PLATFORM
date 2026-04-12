import { describe, it, expect } from 'vitest'
import { isSessionExpired } from '@/lib/middleware-utils'

describe('isSessionExpired', () => {
  it('returns true when expiresAt is in the past', () => {
    const past = new Date(Date.now() - 1000).toISOString()
    expect(isSessionExpired(past)).toBe(true)
  })

  it('returns false when expiresAt is in the future', () => {
    const future = new Date(Date.now() + 60_000).toISOString()
    expect(isSessionExpired(future)).toBe(false)
  })

  it('returns true for invalid date strings', () => {
    expect(isSessionExpired('not-a-date')).toBe(true)
  })

  it('returns true for null', () => {
    expect(isSessionExpired(null)).toBe(true)
  })

  it('returns true for undefined', () => {
    expect(isSessionExpired(undefined)).toBe(true)
  })
})
