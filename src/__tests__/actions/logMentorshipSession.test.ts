import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindFirst = vi.fn()
const mockInsert = vi.fn(() => ({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'new-session-id' }]) }) }))
const mockUpdate = vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }))

vi.mock('@/lib/db/schema', () => ({
    users: {},
    mentorshipPairs: { id: 'id', menteeId: 'menteeId', mentorId: 'mentorId' },
    sessionsLog: { pairId: 'pairId', durationMinutes: 'durationMinutes', notes: 'notes', sessionDate: 'sessionDate', loggedBy: 'loggedBy' },
    learningPathways: { id: 'id', pairId: 'pairId', milestones: 'milestones', progress: 'progress' },
    userBadges: {},
    activityLog: { userId: 'userId', actionType: 'actionType', entityId: 'entityId', impactPoints: 'impactPoints' },
    menteeDocuments: {},
    moderationLog: {},
}))

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((c, v) => ({ eq: [c, v] })),
    and: vi.fn((...args) => ({ and: args })),
    desc: vi.fn((c) => ({ desc: c })),
    ne: vi.fn((c, v) => ({ ne: [c, v] })),
    sql: vi.fn(() => "count_sql"),
}))

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            mentorshipPairs: { findFirst: (...args: any[]) => mockFindFirst('mentorshipPairs', ...args) },
            learningPathways: { findFirst: (...args: any[]) => mockFindFirst('learningPathways', ...args) },
        },
        insert: (...args: any[]) => mockInsert(...args),
        update: (...args: any[]) => mockUpdate(...args),
    },
}))

vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Map()),
}))

const mockGetSession = vi.fn()
vi.mock('@/lib/auth/config', () => ({
    auth: {
        api: { getSession: (...args: any[]) => mockGetSession(...args) },
    },
}))

vi.mock('@/lib/notifications/service', () => ({
    createNotification: vi.fn().mockResolvedValue(undefined),
}))

import { logMentorshipSession } from '@/lib/actions/menteeManagement'
import { db } from '@/lib/db'

describe('logMentorshipSession', () => {
    const validMenteeId = '11111111-1111-4111-8111-111111111111'
    const validMentorId = '22222222-2222-4222-8222-222222222222'

    const validPayload = {
        menteeId: validMenteeId,
        mentorId: validMentorId,
        sessionDate: new Date('2026-05-20'),
        durationMinutes: 60,
        sessionType: 'video_call' as const,
        notes: 'Good session.',
        rating: 5,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockGetSession.mockResolvedValue({ user: { id: validMentorId, role: 'Mentor' } })
        mockFindFirst.mockImplementation((table) => {
            if (table === 'mentorshipPairs') return { id: 'pair-1', menteeId: validMenteeId, mentorId: validMentorId }
            if (table === 'learningPathways') return { id: 'path-1', pairId: 'pair-1', milestones: [] }
            return null
        })
    })

    it('throws UNAUTHENTICATED when session is null', async () => {
        mockGetSession.mockResolvedValue(null)
        await expect(logMentorshipSession(validPayload)).rejects.toThrow('UNAUTHENTICATED')
    })

    it('throws FORBIDDEN when user role is not allowed', async () => {
        mockGetSession.mockResolvedValue({ user: { id: 'some-id', role: 'Mentee' } })
        await expect(logMentorshipSession(validPayload)).rejects.toThrow('FORBIDDEN')
    })

    it('throws validation error for invalid duration', async () => {
        const payload = { ...validPayload, durationMinutes: 10 } // min 15
        await expect(logMentorshipSession(payload)).rejects.toThrow(/Too small/)
    })

    it('throws validation error for invalid rating', async () => {
        const payload = { ...validPayload, rating: 6 } // max 5
        await expect(logMentorshipSession(payload)).rejects.toThrow(/Too big/)
    })

    it('throws PAIR_NOT_FOUND when pair does not exist', async () => {
        mockFindFirst.mockImplementation((table) => {
            if (table === 'mentorshipPairs') return null
            return null
        })
        await expect(logMentorshipSession(validPayload)).rejects.toThrow('PAIR_NOT_FOUND')
    })

    it('successfully logs a session', async () => {
        const result = await logMentorshipSession(validPayload)
        expect(result).toEqual({ success: true, sessionId: 'new-session-id' })

        expect(mockInsert).toHaveBeenCalledWith(expect.anything()) // sessionsLog
        expect(mockInsert).toHaveBeenCalledWith(expect.anything()) // activityLog
    })

    it('updates milestone when milestoneId is provided', async () => {
        const milestoneId = '33333333-3333-4333-8333-333333333333'
        const payload = { ...validPayload, milestoneId }
        mockFindFirst.mockImplementation((table) => {
            if (table === 'mentorshipPairs') return { id: 'pair-1', menteeId: validMenteeId, mentorId: validMentorId }
            if (table === 'learningPathways') return { id: 'path-1', pairId: 'pair-1', milestones: [{ id: milestoneId, status: 'not_started' }] }
            return null
        })

        await logMentorshipSession(payload)

        expect(mockUpdate).toHaveBeenCalled()
    })
})
