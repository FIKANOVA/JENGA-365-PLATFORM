import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/db/schema', () => ({
  userProfileAssets: { id: 'userProfileAssets.id' },
  users: { id: 'users.id' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}))

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
  },
}))

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

// Mock auth config
vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

// We'll also mock the other functions in the file so they don't complain
// Mock profileSynthesizer
vi.mock('@/lib/ai/profileSynthesizer', () => ({
  synthesizeUserProfile: vi.fn(),
}))

vi.mock('@/lib/db/queries/matching', () => ({
  getMentorMatches: vi.fn(),
}))

import { updateUserProfileAsset } from '@/lib/actions/matching'
import { db } from '@/lib/db'
import { synthesizeUserProfile } from '@/lib/ai/profileSynthesizer'
import { auth } from '@/lib/auth/config'

function setupInsert() {
  const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined)
  const values = vi.fn().mockReturnValue({ onConflictDoUpdate })
  vi.mocked(db.insert).mockReturnValue({ values } as any)
  return { values, onConflictDoUpdate }
}

function setupUpdate() {
  const where = vi.fn().mockResolvedValue(undefined)
  const set = vi.fn().mockReturnValue({ where })
  vi.mocked(db.update).mockReturnValue({ set } as any)
  return { set, where }
}

describe('updateUserProfileAsset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-22T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('throws UNAUTHORIZED when session is null', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)

    await expect(
      updateUserProfileAsset({ type: 'CV', url: 'https://example.com/cv.pdf' })
    ).rejects.toThrow('UNAUTHORIZED')
  })

  it('inserts/updates user profile asset and marks embedding as stale', async () => {
    const userId = 'test-user-id'
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: userId },
    } as any)

    const { values, onConflictDoUpdate } = setupInsert()
    const { set, where } = setupUpdate()

    const params = { type: 'LinkedIn' as const, url: 'https://linkedin.com/in/test' }
    const result = await updateUserProfileAsset(params)

    expect(result).toEqual({ success: true })

    // 1. Check asset insert/update
    expect(db.insert).toHaveBeenCalledOnce()
    // Should insert with userId and params
    expect(values).toHaveBeenCalledWith({
      userId,
      ...params,
    })

    // Should update on conflict
    expect(onConflictDoUpdate).toHaveBeenCalledWith({
      target: ['userProfileAssets.id'],
      set: {
        ...params,
        updatedAt: new Date('2026-05-22T10:00:00Z'),
      },
    })

    // 2. Check user update (embeddingStale: true)
    expect(db.update).toHaveBeenCalledOnce()
    expect(set).toHaveBeenCalledWith({ embeddingStale: true })
    expect(where).toHaveBeenCalledWith({
      col: 'users.id',
      val: userId,
    })

    // Verify synthesizeUserProfile is NOT called in this function
    expect(synthesizeUserProfile).not.toHaveBeenCalled()
  })
})

import { triggerAiProfileSynthesis } from '@/lib/actions/matching'

describe('triggerAiProfileSynthesis', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Silence console.error for expected error tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('throws UNAUTHORIZED when session is null', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)

    await expect(triggerAiProfileSynthesis()).rejects.toThrow('UNAUTHORIZED')
  })

  it('calls synthesizeUserProfile with the user id and returns its result', async () => {
    const mockUserId = 'user-123'
    const mockResult = { success: true, profile: { some: 'data' } }

    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: mockUserId },
    } as any)

    vi.mocked(synthesizeUserProfile).mockResolvedValueOnce(mockResult as any)

    const result = await triggerAiProfileSynthesis()

    expect(auth.api.getSession).toHaveBeenCalledOnce()
    expect(synthesizeUserProfile).toHaveBeenCalledOnce()
    expect(synthesizeUserProfile).toHaveBeenCalledWith(mockUserId)
    expect(result).toEqual(mockResult)
  })

  it('catches synthesis errors and returns a failure object', async () => {
    const mockUserId = 'user-456'
    const errorMessage = 'AI Service Unavailable'

    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: mockUserId },
    } as any)

    vi.mocked(synthesizeUserProfile).mockRejectedValueOnce(new Error(errorMessage))

    const result = await triggerAiProfileSynthesis()

    expect(auth.api.getSession).toHaveBeenCalledOnce()
    expect(synthesizeUserProfile).toHaveBeenCalledOnce()
    expect(synthesizeUserProfile).toHaveBeenCalledWith(mockUserId)
    expect(result).toEqual({ success: false, message: errorMessage })
    expect(console.error).toHaveBeenCalledWith("AI Synthesis failed:", expect.any(Error))
  })
})
