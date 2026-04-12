// src/__tests__/dashboard/interview-gate.test.ts
import { describe, it, expect } from 'vitest'

// Test the gate logic in isolation as a pure function.
// (The layout is a Next.js server component — we extract and test the logic here first,
// then wire the same logic into the layout.)
export function shouldRedirectToInterview(
  role: string,
  intakeCompleted: boolean,
  embedding: number[] | null,
): boolean {
  if (role !== 'Mentee') return false
  if (!intakeCompleted) return false // handled by existing intake gate
  return embedding === null
}

describe('shouldRedirectToInterview', () => {
  it('redirects Mentee with completed intake but no embedding', () => {
    expect(shouldRedirectToInterview('Mentee', true, null)).toBe(true)
  })

  it('does not redirect Mentee who has completed interview', () => {
    expect(shouldRedirectToInterview('Mentee', true, new Array(768).fill(0.1))).toBe(false)
  })

  it('does not redirect Mentor (different role)', () => {
    expect(shouldRedirectToInterview('Mentor', true, null)).toBe(false)
  })

  it('does not redirect Mentee who has not completed intake (separate gate handles it)', () => {
    expect(shouldRedirectToInterview('Mentee', false, null)).toBe(false)
  })
})
