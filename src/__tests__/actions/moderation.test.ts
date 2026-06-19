import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', isApproved: 'isApproved', status: 'status', rejectionReason: 'rejectionReason' },
  articles: { id: 'id', status: 'status', approvedBy: 'approvedBy', publishedAt: 'publishedAt', moderatorId: 'moderatorId', rejectionFeedback: 'rejectionFeedback', sanityDocId: 'sanityDocId', authorId: 'authorId', coAuthorIds: 'coAuthorIds', title: 'title', slug: 'slug' },
  moderationLog: { id: 'id', moderatorId: 'moderatorId', actionType: 'actionType', targetId: 'targetId', targetType: 'targetType', notes: 'notes' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_c, v) => ({ eq: v })),
  and: vi.fn((...a) => a),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    query: {
        articles: { findFirst: vi.fn() }
    }
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: { getSession: vi.fn() },
  },
}))

vi.mock('@/lib/notifications/service', () => ({
    createNotification: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('@/lib/sanity/syncArticle', () => ({
    publishArticleToSanity: vi.fn().mockResolvedValue('sanity-doc-id'),
    unpublishArticleFromSanity: vi.fn().mockResolvedValue(undefined)
}))

import { approveUser, rejectUser, suspendUser, approveArticle, rejectArticle } from '@/lib/actions/moderation'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications/service'
import { publishArticleToSanity, unpublishArticleFromSanity } from '@/lib/sanity/syncArticle'

// Setup mocks
function setupUpdate() {
    const mockSet = vi.fn().mockReturnThis()
    const mockWhere = vi.fn().mockResolvedValue(undefined)
    vi.mocked(db.update).mockReturnValue({ set: mockSet, where: mockWhere } as any)
    return { mockSet, mockWhere }
}

function setupInsert() {
    const mockValues = vi.fn().mockResolvedValue(undefined)
    vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any)
    return { mockValues }
}

describe('User Moderation Actions', () => {
    beforeEach(() => { vi.clearAllMocks() })

    describe('approveUser', () => {
        it('throws UNAUTHORIZED if not logged in', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)
            await expect(approveUser('user-1')).rejects.toThrow('UNAUTHORIZED')
        })

        it('throws FORBIDDEN if not moderator', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'u-1', role: 'Mentor' } } as any)
            await expect(approveUser('user-1')).rejects.toThrow('FORBIDDEN')
        })

        it('approves a user successfully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator' } } as any)
            const { mockSet, mockWhere } = setupUpdate()
            const { mockValues } = setupInsert()

            const result = await approveUser('user-1')

            expect(result.success).toBe(true)
            expect(db.update).toHaveBeenCalled()
            expect(mockSet).toHaveBeenCalledWith({ isApproved: true, status: 'active' })
            expect(mockWhere).toHaveBeenCalled()
            expect(db.insert).toHaveBeenCalled()
            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                moderatorId: 'mod-1',
                actionType: 'user_approved',
                targetId: 'user-1'
            }))
            expect(createNotification).toHaveBeenCalledWith('user-1', 'user_approved', expect.any(Object))
        })

        it('handles notification failure gracefully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator' } } as any)
            setupUpdate()
            setupInsert()
            vi.mocked(createNotification).mockRejectedValueOnce(new Error('Notification failed'))

            const result = await approveUser('user-1')
            expect(result.success).toBe(true)
        })
    })

    describe('rejectUser', () => {
        it('rejects a user with a reason successfully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator' } } as any)
            const { mockSet, mockWhere } = setupUpdate()
            const { mockValues } = setupInsert()

            const result = await rejectUser('user-1', 'Incomplete profile')

            expect(result.success).toBe(true)
            expect(mockSet).toHaveBeenCalledWith({ isApproved: false, status: 'pending', rejectionReason: 'Incomplete profile' })
            expect(mockWhere).toHaveBeenCalled()
            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                moderatorId: 'mod-1',
                actionType: 'user_rejected',
                targetId: 'user-1',
                notes: 'Incomplete profile'
            }))
            expect(createNotification).toHaveBeenCalledWith('user-1', 'user_rejected', expect.any(Object))
        })

        it('rejects a user without a reason successfully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator' } } as any)
            const { mockSet, mockWhere } = setupUpdate()
            const { mockValues } = setupInsert()

            const result = await rejectUser('user-1')

            expect(result.success).toBe(true)
            expect(mockSet).toHaveBeenCalledWith({ isApproved: false, status: 'pending', rejectionReason: null })
            expect(mockWhere).toHaveBeenCalled()
            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                notes: undefined
            }))
            expect(createNotification).toHaveBeenCalledWith('user-1', 'user_rejected', expect.objectContaining({
                body: "Your application was not approved at this time. Please contact support for more information."
            }))
        })

        it('handles notification failure gracefully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator' } } as any)
            setupUpdate()
            setupInsert()
            vi.mocked(createNotification).mockRejectedValueOnce(new Error('Notification failed'))

            const result = await rejectUser('user-1')
            expect(result.success).toBe(true)
        })
    })

    describe('suspendUser', () => {
        it('suspends a user successfully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator' } } as any)
            const { mockSet, mockWhere } = setupUpdate()
            const { mockValues } = setupInsert()

            const result = await suspendUser('user-1')

            expect(result.success).toBe(true)
            expect(mockSet).toHaveBeenCalledWith({ isApproved: false, status: 'suspended' })
            expect(mockWhere).toHaveBeenCalled()
            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                moderatorId: 'mod-1',
                actionType: 'user_suspended',
                targetId: 'user-1',
            }))
        })

        it('handles notification failure gracefully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator' } } as any)
            setupUpdate()
            setupInsert()
            vi.mocked(createNotification).mockRejectedValueOnce(new Error('Notification failed'))

            const result = await suspendUser('user-1')
            expect(result.success).toBe(true)
        })
    })
})

describe('Article Moderation Actions', () => {
    // Suppress console.error for Sanity failures
    const originalConsoleError = console.error
    beforeEach(() => {
        vi.clearAllMocks()
        console.error = vi.fn()
    })

    afterEach(() => {
        console.error = originalConsoleError
    })

    describe('approveArticle', () => {
        it('throws FORBIDDEN if moderator lacks PUBLISH_ARTICLE capability', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator', moderationScope: '["mentor_applications"]' } } as any)
            await expect(approveArticle('art-1')).rejects.toThrow('FORBIDDEN:PUBLISH_ARTICLE')
        })

        it('throws Error if article not found', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator', moderationScope: '["content"]' } } as any)
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(undefined as any)
            await expect(approveArticle('art-1')).rejects.toThrow('Article not found')
        })

        it('approves and publishes an article successfully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator', moderationScope: '["content"]' } } as any)

            const mockArticle = { id: 'art-1', authorId: 'a-1', title: 'Test Article', slug: 'test-article' }
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(mockArticle as any)

            const { mockSet, mockWhere } = setupUpdate()
            const { mockValues } = setupInsert()

            const result = await approveArticle('art-1')

            expect(result.success).toBe(true)
            expect(result.sanityDocId).toBe('sanity-doc-id')

            expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
                status: 'published',
                approvedBy: 'mod-1'
            }))

            expect(publishArticleToSanity).toHaveBeenCalledWith('art-1')

            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                moderatorId: 'mod-1',
                actionType: 'article_approved',
                targetId: 'art-1',
                notes: 'Mirrored to Sanity (sanity-doc-id)'
            }))

            expect(createNotification).toHaveBeenCalledWith('a-1', 'article_approved', expect.any(Object))
        })

        it('approves and publishes an article successfully with co-authors', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator', moderationScope: '["content"]' } } as any)

            const mockArticle = { id: 'art-1', authorId: 'a-1', coAuthorIds: ['a-2', 'a-3'], title: 'Test Article', slug: 'test-article' }
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(mockArticle as any)

            const { mockSet, mockWhere } = setupUpdate()
            const { mockValues } = setupInsert()

            const result = await approveArticle('art-1')

            expect(result.success).toBe(true)
            expect(createNotification).toHaveBeenCalledWith('a-1', 'article_approved', expect.objectContaining({
                body: `Your article "Test Article" has been approved and is now live.`
            }))
            expect(createNotification).toHaveBeenCalledWith('a-2', 'article_approved', expect.objectContaining({
                body: `An article you co-authored, "Test Article", is now live.`
            }))
        })

        it('handles null coAuthorIds correctly', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator', moderationScope: '["content"]' } } as any)

            const mockArticle = { id: 'art-1', authorId: 'a-1', coAuthorIds: null, title: 'Test Article', slug: 'test-article' }
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(mockArticle as any)

            setupUpdate()
            setupInsert()

            const result = await approveArticle('art-1')

            expect(result.success).toBe(true)
            expect(createNotification).toHaveBeenCalledTimes(1)
        })

        it('handles Sanity sync failure gracefully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator', moderationScope: '["content"]' } } as any)

            const mockArticle = { id: 'art-1', authorId: 'a-1', title: 'Test Article', slug: 'test-article' }
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(mockArticle as any)
            vi.mocked(publishArticleToSanity).mockRejectedValueOnce(new Error('Sanity error'))

            const { mockSet, mockWhere } = setupUpdate()
            const { mockValues } = setupInsert()

            const result = await approveArticle('art-1')

            expect(result.success).toBe(true)
            expect(result.sanityDocId).toBeNull()

            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                notes: 'Sanity mirror failed — manual repair required'
            }))
            expect(console.error).toHaveBeenCalled()
        })

        it('handles notification failure gracefully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator', moderationScope: '["content"]' } } as any)

            const mockArticle = { id: 'art-1', authorId: 'a-1', title: 'Test Article', slug: 'test-article' }
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(mockArticle as any)
            vi.mocked(createNotification).mockRejectedValueOnce(new Error('Notification failed'))

            setupUpdate()
            setupInsert()

            const result = await approveArticle('art-1')
            expect(result.success).toBe(true)
        })
    })

    describe('rejectArticle', () => {
        it('throws FORBIDDEN if moderator lacks APPROVE_ARTICLE capability', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator', moderationScope: '[]' } } as any)
            await expect(rejectArticle('art-1')).rejects.toThrow('FORBIDDEN:APPROVE_ARTICLE')
        })

        it('throws Error if article not found', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator', moderationScope: '["content"]' } } as any)
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(undefined as any)
            await expect(rejectArticle('art-1')).rejects.toThrow('Article not found')
        })

        it('rejects an article successfully and unpublishes if was published', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'SuperAdmin' } } as any)

            const mockArticle = { id: 'art-1', status: 'published', authorId: 'a-1', coAuthorIds: ['a-2'] }
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(mockArticle as any)

            const { mockSet, mockWhere } = setupUpdate()
            const { mockValues } = setupInsert()

            const result = await rejectArticle('art-1', 'Needs work')

            expect(result.success).toBe(true)

            expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
                status: 'rejected',
                moderatorId: 'mod-1',
                rejectionFeedback: 'Needs work'
            }))

            expect(unpublishArticleFromSanity).toHaveBeenCalledWith('art-1')

            expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({
                actionType: 'article_rejected',
                notes: 'Needs work'
            }))

            expect(createNotification).toHaveBeenCalledWith('a-1', 'article_rejected', expect.objectContaining({
                body: 'Needs work'
            }))
            expect(createNotification).toHaveBeenCalledWith('a-2', 'article_rejected', expect.objectContaining({
                body: 'Needs work'
            }))
        })

        it('handles null coAuthorIds correctly', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'SuperAdmin' } } as any)

            const mockArticle = { id: 'art-1', status: 'draft', authorId: 'a-1', coAuthorIds: null }
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(mockArticle as any)

            setupUpdate()
            setupInsert()

            const result = await rejectArticle('art-1')

            expect(result.success).toBe(true)
            expect(createNotification).toHaveBeenCalledTimes(1)
        })

        it('rejects an article without feedback and unpublishes if has sanityDocId', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'SuperAdmin' } } as any)

            const mockArticle = { id: 'art-1', status: 'draft', sanityDocId: 'sanity-id', authorId: 'a-1' }
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(mockArticle as any)

            const { mockSet, mockWhere } = setupUpdate()
            const { mockValues } = setupInsert()

            const result = await rejectArticle('art-1')

            expect(result.success).toBe(true)
            expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
                rejectionFeedback: null
            }))
            expect(unpublishArticleFromSanity).toHaveBeenCalledWith('art-1')

            expect(createNotification).toHaveBeenCalledWith('a-1', 'article_rejected', expect.objectContaining({
                body: `An article you co-authored requires changes before publishing.`
            }))
        })

        it('handles Sanity unpublish failure gracefully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'SuperAdmin' } } as any)

            const mockArticle = { id: 'art-1', status: 'published', authorId: 'a-1' }
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(mockArticle as any)
            vi.mocked(unpublishArticleFromSanity).mockRejectedValueOnce(new Error('Sanity error'))

            const { mockSet, mockWhere } = setupUpdate()
            const { mockValues } = setupInsert()

            // Should not throw
            const result = await rejectArticle('art-1')
            expect(result.success).toBe(true)
            expect(console.error).toHaveBeenCalled()
        })

        it('handles notification failure gracefully', async () => {
            const { auth } = await import('@/lib/auth/config')
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'SuperAdmin' } } as any)

            const mockArticle = { id: 'art-1', status: 'published', authorId: 'a-1' }
            vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(mockArticle as any)
            vi.mocked(createNotification).mockRejectedValueOnce(new Error('Notification failed'))

            setupUpdate()
            setupInsert()

            const result = await rejectArticle('art-1')
            expect(result.success).toBe(true)
        })
    })
})
