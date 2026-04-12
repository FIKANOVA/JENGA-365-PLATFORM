// Integration testing for the intake page is covered by E2E tests.
// Unit tests for individual components are in components.test.tsx
// Unit tests for the server action are in action.test.ts

import { describe, it } from 'vitest'

describe('IntakePage', () => {
  it.todo('wizard renders all three steps in sequence (E2E)')
  it.todo('submitting with valid data redirects to /dashboard (E2E)')
  it.todo('embedding API failure still completes intake (E2E)')
})
