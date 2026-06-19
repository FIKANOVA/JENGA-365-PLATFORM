import { describe, it, expect, vi, beforeEach } from 'vitest'

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

// Mock profileSynthesizer
vi.mock('@/lib/ai/profileSynthesizer', () => ({
  synthesizeUserProfile: vi.fn(),
}))

import { triggerAiProfileSynthesis } from '@/lib/actions/matching'
import { auth } from '@/lib/auth/config'
import { synthesizeUserProfile } from '@/lib/ai/profileSynthesizer'

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
