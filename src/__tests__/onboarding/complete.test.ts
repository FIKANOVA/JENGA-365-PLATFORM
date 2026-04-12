import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    update: vi.fn(),
  },
}))
vi.mock('@/lib/db/schema', () => ({ users: { name: 'users' } }))
vi.mock('@/lib/auth/config', () => ({
  auth: { api: { getSession: vi.fn() } },
}))
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Map()) }))
vi.mock('drizzle-orm', () => ({ eq: vi.fn(() => 'eq-result') }))

import { completeOnboarding } from '@/lib/actions/onboarding'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth/config'

const mockSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) })
const mockUpdate = vi.fn().mockReturnValue({ set: mockSet })

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(db.update).mockImplementation(mockUpdate)
})

function mockSession(role: string) {
  vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'user-1' } } as any)
  vi.mocked(db.query.users.findFirst).mockResolvedValue({ id: 'user-1', role, onboarded: false } as any)
}

describe('completeOnboarding — status routing', () => {
  it('sets Mentee to active and redirects to mentee dashboard', async () => {
    mockSession('Mentee')
    const result = await completeOnboarding('summary')
    const setArg = mockSet.mock.calls[0][0]
    expect(setArg.status).toBe('active')
    expect(result.redirectTo).toBe('/dashboard/mentee')
  })

  it('sets Mentor to pending_approval and redirects to pending-approval', async () => {
    mockSession('Mentor')
    const result = await completeOnboarding('summary')
    const setArg = mockSet.mock.calls[0][0]
    expect(setArg.status).toBe('pending_approval')
    expect(result.redirectTo).toBe('/pending-approval')
  })

  it('sets CorporatePartner to pending_approval and redirects to pending-approval', async () => {
    mockSession('CorporatePartner')
    const result = await completeOnboarding('summary')
    const setArg = mockSet.mock.calls[0][0]
    expect(setArg.status).toBe('pending_approval')
    expect(result.redirectTo).toBe('/pending-approval')
  })

  it('sets Moderator to active', async () => {
    mockSession('Moderator')
    const result = await completeOnboarding('summary')
    const setArg = mockSet.mock.calls[0][0]
    expect(setArg.status).toBe('active')
    expect(result.redirectTo).toBe('/dashboard/moderator')
  })
})
