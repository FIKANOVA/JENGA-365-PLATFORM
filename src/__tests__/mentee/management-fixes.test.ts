import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindFirst = vi.fn()
const mockInsert = vi.fn(() => ({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'session-1' }]) }) }))
const mockUpdate = vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }))
const mockSelect = vi.fn(() => ({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ orderBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }) }) }) }))

const mockGetSession = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      users: { findFirst: mockFindFirst },
      mentorshipPairs: { findFirst: vi.fn().mockResolvedValue({ id: 'pair-1' }) },
      learningPathways: { findFirst: mockFindFirst },
    },
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect,
  },
}))
vi.mock('@/lib/db/schema', () => ({
  users: {}, mentorshipPairs: {}, sessionsLog: {}, learningPathways: { pairId: 'pairId', id: 'id' },
  activityLog: {}, menteeDocuments: {}, userBadges: {}, moderationLog: {},
}))
vi.mock('@/lib/auth/config', () => ({
  auth: { api: { getSession: (...args: any[]) => mockGetSession(...args) } },
}))
vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Map()) }))
vi.mock('drizzle-orm', () => ({ eq: vi.fn((field, val) => ({ field, val })), and: vi.fn(), desc: vi.fn(), sql: vi.fn() }))
vi.mock('zod', async () => {
  const actual = await vi.importActual('zod')
  return actual
})

import { createNotification } from '@/lib/notifications/service'

describe('BUG-09 — logMentorshipSession fires real notification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ user: { id: 'mentor-1', role: 'Mentor' } })
  })

  it('calls createNotification after successful session log', async () => {
    const { logMentorshipSession } = await import('@/lib/actions/menteeManagement')
    await logMentorshipSession({
      menteeId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      mentorId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      sessionDate: new Date('2026-04-06'),
      durationMinutes: 60,
      sessionType: 'video_call',
      notes: 'Great session covering career planning.',
      rating: 5,
    })
    expect(createNotification).toHaveBeenCalledWith(
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'session_reminder',
      expect.objectContaining({ title: expect.any(String), body: expect.any(String) })
    )
  })
})

describe('BUG-08 — getMenteeDetail uses learningPathways.pairId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSession.mockResolvedValue({ user: { id: 'mod-1', role: 'Moderator' } })
  })

  it('queries learningPathways by pairId field, not id', async () => {
    const { eq } = await import('drizzle-orm')
    const { getMenteeDetail } = await import('@/lib/actions/menteeManagement')
    const { learningPathways } = await import('@/lib/db/schema')

    mockFindFirst.mockResolvedValue({ id: 'user-1', role: 'Mentee' })

    await getMenteeDetail('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11').catch(() => {})

    const eqCalls = vi.mocked(eq).mock.calls
    const pathwayCall = eqCalls.find(call => call[0] === learningPathways.pairId)
    expect(pathwayCall).toBeDefined()
  })
})
