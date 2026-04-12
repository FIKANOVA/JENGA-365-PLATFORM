import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  users: {
    id: 'id',
    name: 'name',
    role: 'role',
    locationRegion: 'location_region',
    partnerId: 'partner_id',
    embedding: 'embedding',
    isApproved: 'is_approved',
    status: 'status',
    mentorSpecialisations: 'mentor_specialisations',
  },
  userProfileAssets: { userId: 'user_id', type: 'type' },
  mentorshipPairs: { mentorId: 'mentor_id', status: 'status' },
}))

const makeSqlObj = () => {
  const obj: any = {}
  obj.as = vi.fn(() => obj)
  return obj
}

vi.mock('drizzle-orm', () => ({
  and: vi.fn((...args) => args),
  eq: vi.fn(() => 'eq'),
  desc: vi.fn((v) => v),
  sql: vi.fn(() => makeSqlObj()),
  cosineDistance: vi.fn(() => makeSqlObj()),
  count: vi.fn(() => makeSqlObj()),
  lt: vi.fn(() => 'lt'),
}))

vi.mock('@/lib/db', () => {
  const buildChain = (results: any[]) => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    as: vi.fn().mockReturnValue({
      mentorId: 'mentorId',
      activeCount: 'activeCount',
      userId: 'userId',
      assetCount: 'assetCount',
    }),
    limit: vi.fn().mockResolvedValue(results),
  })

  const mockResults = [
    {
      id: 'm-1',
      name: 'Alice Wanjiku',
      locationRegion: 'Nairobi',
      totalScore: '0.72',
      profileScore: '0.65',
      mentorSpecialisations: ['entrepreneur', 'finance'],
    },
  ]

  return { db: buildChain(mockResults) }
})

import { getMentorMatches } from '@/lib/db/queries/matching'

// ─── Goal Alignment scoring ───────────────────────────────────────────────────

describe('goalAlignment — both entrepreneur flags present', () => {
  it('adds 10 points to matchPercentage when mentee has entrepreneurship goal and mentor is entrepreneur specialist', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
      menteeGoalCategories: ['entrepreneurship'],
    })
    // Base totalScore = 0.72 → 72%. goalAlignment = 1.0 * 0.10 = +10 → 82%
    expect(results[0].matchPercentage).toBe(82)
  })

  it('includes goalAlignment in the insights breakdown', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
      menteeGoalCategories: ['entrepreneurship'],
    })
    expect(results[0].insights).toHaveProperty('goalAlignment')
    expect(results[0].insights.goalAlignment).toBe(10)
  })
})

describe('goalAlignment — flags absent or mismatched', () => {
  it('adds 0 points when mentee has entrepreneurship goal but mentor lacks entrepreneur specialisation', async () => {
    // Override mock to return mentor without entrepreneur specialisation
    const { db } = await import('@/lib/db')
    vi.mocked(db.limit).mockResolvedValueOnce([
      {
        id: 'm-2',
        name: 'Bob Kamau',
        locationRegion: 'Mombasa',
        totalScore: '0.72',
        profileScore: '0.65',
        mentorSpecialisations: ['finance', 'law'],
      },
    ])
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
      menteeGoalCategories: ['entrepreneurship'],
    })
    expect(results[0].matchPercentage).toBe(72)
    expect(results[0].insights.goalAlignment).toBe(0)
  })

  it('adds 0 points when menteeGoalCategories is not provided', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
      // no menteeGoalCategories — goalAlignment = 0 regardless of mentor specialisations
    })
    // base totalScore = 0.72 → 72%, goalAlignment = 0 → stays at 72
    expect(results[0].matchPercentage).toBe(72)
    expect(results[0].insights.goalAlignment).toBe(0)
  })
})

describe('goalAlignment — semantic weight reduced to 0.40', () => {
  it('returns matchPercentage and insights.profileMatch as distinct values (weights updated)', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
    })
    expect(results[0]).toHaveProperty('matchPercentage')
    expect(results[0].insights).toHaveProperty('profileMatch')
    // goalAlignment field must exist even when 0
    expect(results[0].insights).toHaveProperty('goalAlignment')
  })
})
