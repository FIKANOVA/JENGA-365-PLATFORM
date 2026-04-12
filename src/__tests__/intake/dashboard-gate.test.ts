import { describe, it, expect } from 'vitest'

// ── Dashboard Intake Gate — Unit Tests ──────────────────────────────────────
// The dashboard layout is a React Server Component. Testing it directly requires
// a full Next.js environment. Per the task spec, we test the gate condition as
// a pure function extracted from the layout logic.
//
// The actual integration is verified by E2E testing.

/**
 * Mirrors the gate condition in src/app/dashboard/layout.tsx:
 *   const intakeCompleted = (session.user as any).intakeCompleted ?? false
 *   if (userRole === 'Mentee' && !intakeCompleted) redirect('/onboarding/intake')
 */
function shouldRedirectToIntake(role: string, intakeCompleted: boolean): boolean {
  return role === 'Mentee' && !intakeCompleted
}

describe('Dashboard intake gate — shouldRedirectToIntake()', () => {
  // ── Mentee cases ──────────────────────────────────────────────────────────
  describe('Mentee role', () => {
    it('redirects when intakeCompleted is false', () => {
      expect(shouldRedirectToIntake('Mentee', false)).toBe(true)
    })

    it('does NOT redirect when intakeCompleted is true', () => {
      expect(shouldRedirectToIntake('Mentee', true)).toBe(false)
    })
  })

  // ── Non-Mentee roles pass through regardless of intakeCompleted ───────────
  describe('Mentor role', () => {
    it('does NOT redirect when intakeCompleted is false', () => {
      expect(shouldRedirectToIntake('Mentor', false)).toBe(false)
    })

    it('does NOT redirect when intakeCompleted is true', () => {
      expect(shouldRedirectToIntake('Mentor', true)).toBe(false)
    })
  })

  describe('SuperAdmin role', () => {
    it('does NOT redirect when intakeCompleted is false', () => {
      expect(shouldRedirectToIntake('SuperAdmin', false)).toBe(false)
    })

    it('does NOT redirect when intakeCompleted is true', () => {
      expect(shouldRedirectToIntake('SuperAdmin', true)).toBe(false)
    })
  })

  describe('Moderator role', () => {
    it('does NOT redirect regardless of intakeCompleted', () => {
      expect(shouldRedirectToIntake('Moderator', false)).toBe(false)
      expect(shouldRedirectToIntake('Moderator', true)).toBe(false)
    })
  })

  describe('CorporatePartner role', () => {
    it('does NOT redirect regardless of intakeCompleted', () => {
      expect(shouldRedirectToIntake('CorporatePartner', false)).toBe(false)
      expect(shouldRedirectToIntake('CorporatePartner', true)).toBe(false)
    })
  })

  // ── Default / nullish intakeCompleted (layout uses ?? false) ─────────────
  describe('nullish intakeCompleted handling', () => {
    it('Mentee with undefined intakeCompleted (treated as false) redirects', () => {
      const intakeCompleted = (undefined as unknown as boolean) ?? false
      expect(shouldRedirectToIntake('Mentee', intakeCompleted)).toBe(true)
    })

    it('Mentee with null intakeCompleted (treated as false) redirects', () => {
      const intakeCompleted = (null as unknown as boolean) ?? false
      expect(shouldRedirectToIntake('Mentee', intakeCompleted)).toBe(true)
    })
  })
})
