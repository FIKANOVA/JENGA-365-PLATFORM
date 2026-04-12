import { describe, it, expect } from 'vitest'
import { computeResilienceScore } from '@/lib/intake/scoring'

describe('computeResilienceScore', () => {
  it('scores minimum: Never + Barely coping = 1', () => {
    expect(computeResilienceScore('Never', 'Barely coping')).toBe(1)
  })

  it('scores maximum: Always + Thriving = 10', () => {
    expect(computeResilienceScore('Always', 'Thriving')).toBe(10)
  })

  it('scores mid-low: Rarely + Struggling = 4', () => {
    // Q1=3, Q2=4 → (3+4)/2 = 3.5 → rounds to 4
    expect(computeResilienceScore('Rarely', 'Struggling')).toBe(4)
  })

  it('scores mid: Sometimes + Managing = 6', () => {
    // Q1=5, Q2=7 → (5+7)/2 = 6
    expect(computeResilienceScore('Sometimes', 'Managing')).toBe(6)
  })

  it('scores high: Often + Thriving = 9', () => {
    // Q1=8, Q2=10 → (8+10)/2 = 9
    expect(computeResilienceScore('Often', 'Thriving')).toBe(9)
  })

  it('always returns an integer', () => {
    const score = computeResilienceScore('Rarely', 'Struggling')
    expect(Number.isInteger(score)).toBe(true)
  })

  it('always returns a value between 1 and 10', () => {
    const combos: Array<[Parameters<typeof computeResilienceScore>[0], Parameters<typeof computeResilienceScore>[1]]> = [
      ['Never', 'Barely coping'],
      ['Sometimes', 'Managing'],
      ['Always', 'Thriving'],
    ]
    for (const [q1, q2] of combos) {
      const score = computeResilienceScore(q1, q2)
      expect(score).toBeGreaterThanOrEqual(1)
      expect(score).toBeLessThanOrEqual(10)
    }
  })
})
