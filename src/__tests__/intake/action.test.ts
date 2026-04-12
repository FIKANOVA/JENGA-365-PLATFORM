import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all external dependencies before importing the action
vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([{ id: 'intake-1' }])
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([])
      })
    }),
  },
}))

vi.mock('@/lib/db/schema', () => ({
  menteeIntake: { name: 'mentee_intake' },
  resilienceAssessments: { name: 'resilience_assessments' },
  users: { name: 'users' },
}))

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        user: { id: 'user-123', role: 'Mentee', intakeCompleted: false },
        session: {},
      }),
    },
  },
}))

vi.mock('@/lib/ai/embeddings', () => ({
  generateProfileEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Map()),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn().mockReturnValue('eq-result'),
}))

import { submitDiagnosticIntake } from '@/lib/actions/intake'
import { generateProfileEmbedding } from '@/lib/ai/embeddings'
import { db } from '@/lib/db'
import type { IntakeFormData } from '@/lib/intake/types'

const validFormData: IntakeFormData = {
  q1: 'Sometimes',
  q2: 'Managing',
  academicStanding: 'Good',
  careerTags: ['Software Engineering'],
  careerFreeText: 'I want to build products.',
  supportTypes: ['Career Guidance'],
  preferredMentorshipStyle: 'Strict',
}

describe('submitDiagnosticIntake', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mocks to default success state
    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue([{ id: 'intake-1' }])
    } as any)
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([])
      })
    } as any)
    vi.mocked(generateProfileEmbedding).mockResolvedValue(new Array(768).fill(0.1))
  })

  it('inserts a mentee_intake record', async () => {
    await submitDiagnosticIntake(validFormData)
    expect(db.insert).toHaveBeenCalled()
  })

  it('inserts a resilience_assessment (insert called twice)', async () => {
    await submitDiagnosticIntake(validFormData)
    expect(db.insert).toHaveBeenCalledTimes(2)
  })

  it('calls generateProfileEmbedding with a non-empty string', async () => {
    await submitDiagnosticIntake(validFormData)
    expect(generateProfileEmbedding).toHaveBeenCalledWith(expect.any(String))
    const callArg = vi.mocked(generateProfileEmbedding).mock.calls[0][0]
    expect(callArg.length).toBeGreaterThan(0)
  })

  it('updates users table to set intakeCompleted=true', async () => {
    await submitDiagnosticIntake(validFormData)
    expect(db.update).toHaveBeenCalled()
  })

  it('still completes and sets intakeCompleted=true even if generateProfileEmbedding throws', async () => {
    vi.mocked(generateProfileEmbedding).mockRejectedValueOnce(new Error('OpenAI timeout'))

    // Should not throw — intake data must be saved even if embedding fails
    await expect(submitDiagnosticIntake(validFormData)).resolves.not.toThrow()

    // db.update (intakeCompleted=true) must still be called
    expect(db.update).toHaveBeenCalled()
  })

  it('returns error object if session is missing (no redirect)', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

    const result = await submitDiagnosticIntake(validFormData)
    expect(result).toEqual({ success: false, error: 'Unauthorised' })
    // redirect should NOT be called
    const { redirect } = await import('next/navigation')
    expect(redirect).not.toHaveBeenCalled()
  })
})
