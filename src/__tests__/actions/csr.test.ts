import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/db/schema', () => ({
    users: { id: 'users.id', partnerId: 'users.partnerId', role: 'users.role' },
    mentorshipPairs: { partnerId: 'mentorshipPairs.partnerId', status: 'mentorshipPairs.status' },
    donations: { userId: 'donations.userId', amount: 'donations.amount' },
    projectLocations: { funderId: 'projectLocations.funderId' },
}))

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((col, val) => ({ eq: { col, val } })),
    and: vi.fn((...args) => ({ and: args })),
    count: vi.fn(() => 'count'),
    sum: vi.fn((col) => ({ sum: col })),
    inArray: vi.fn((col, vals) => ({ inArray: { col, vals } })),
}))

const mockDbState: any = {
    menteesCount: 0,
    activePairsCount: 0,
    partnerUserIds: [],
    donationsTotal: 0,
    projectsCount: 0,
}

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn().mockImplementation((selection) => {
            return {
                from: vi.fn().mockImplementation((table) => {
                    return {
                        where: vi.fn().mockImplementation((condition) => {
                            // Basic routing based on the selected fields / tables
                            if (selection && selection.count === 'count') {
                                if (table.partnerId === 'users.partnerId') {
                                    return Promise.resolve([{ count: mockDbState.menteesCount }])
                                }
                                if (table.partnerId === 'mentorshipPairs.partnerId') {
                                    return Promise.resolve([{ count: mockDbState.activePairsCount }])
                                }
                                if (table.funderId === 'projectLocations.funderId') {
                                    return Promise.resolve([{ count: mockDbState.projectsCount }])
                                }
                            }
                            if (selection && selection.id === 'users.id') {
                                return Promise.resolve(mockDbState.partnerUserIds)
                            }
                            if (selection && selection.total) {
                                return Promise.resolve([{ total: mockDbState.donationsTotal }])
                            }
                            return Promise.resolve([])
                        })
                    }
                })
            }
        })
    }
}))

vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}))

const mockSession: any = { user: null }

vi.mock('@/lib/auth/config', () => ({
    auth: {
        api: {
            getSession: vi.fn().mockImplementation(async () => {
                if (mockSession.user === null) return null;
                return { user: mockSession.user }
            })
        }
    }
}))

import { getCsrStats } from '@/lib/actions/csr'

describe('getCsrStats', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSession.user = null
        mockDbState.menteesCount = 0
        mockDbState.activePairsCount = 0
        mockDbState.partnerUserIds = []
        mockDbState.donationsTotal = 0
        mockDbState.projectsCount = 0
    })

    it('throws UNAUTHORIZED when session is null', async () => {
        mockSession.user = null
        await expect(getCsrStats('partner-123')).rejects.toThrow('UNAUTHORIZED')
    })

    it('throws No partner ID found when neither arg nor session provides one', async () => {
        mockSession.user = { role: 'SuperAdmin' }
        await expect(getCsrStats()).rejects.toThrow('No partner ID found')
    })

    it('throws UNAUTHORIZED when role is not allowed', async () => {
        mockSession.user = { role: 'Mentee', partnerId: 'partner-123' }
        await expect(getCsrStats()).rejects.toThrow('UNAUTHORIZED')
    })

    it('returns stats when called with CorporatePartner and valid partnerId', async () => {
        mockSession.user = { role: 'CorporatePartner', partnerId: 'partner-123' }

        mockDbState.menteesCount = 5
        mockDbState.activePairsCount = 3
        mockDbState.partnerUserIds = [{ id: 'user-1' }, { id: 'user-2' }]
        mockDbState.donationsTotal = 1500.50
        mockDbState.projectsCount = 2

        const result = await getCsrStats()
        expect(result).toEqual({
            menteesSponsored: 5,
            activeMentorships: 3,
            donationsTotal: 1500.50,
            projectsFunded: 2,
        })
    })

    it('returns stats using explicit partnerId over session partnerId', async () => {
        mockSession.user = { role: 'SuperAdmin', partnerId: 'admin-partner' }

        mockDbState.menteesCount = 10
        mockDbState.activePairsCount = 5
        mockDbState.partnerUserIds = []
        mockDbState.donationsTotal = null // should default to 0
        mockDbState.projectsCount = 1

        const result = await getCsrStats('explicit-partner')
        expect(result).toEqual({
            menteesSponsored: 10,
            activeMentorships: 5,
            donationsTotal: 0,
            projectsFunded: 1,
        })
    })

    it('handles null values from db queries gracefully', async () => {
        mockSession.user = { role: 'Moderator', partnerId: 'partner-456' }

        mockDbState.menteesCount = null
        mockDbState.activePairsCount = null
        mockDbState.partnerUserIds = [] // skipping donations query
        mockDbState.donationsTotal = null
        mockDbState.projectsCount = null

        const result = await getCsrStats()
        expect(result).toEqual({
            menteesSponsored: 0,
            activeMentorships: 0,
            donationsTotal: 0,
            projectsFunded: 0,
        })
    })
})
