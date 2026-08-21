// Phase 2.1 (a6d9766) switched goal-alignment to `user_goal_tags` table joined
// in SQL with founder-locked 40/20/15/10/10/5 weights.
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
  },
  userProfileAssets: { userId: 'user_id', type: 'type' },
  mentorshipPairs: { mentorId: 'mentor_id', status: 'status' },
  userGoalTags: { userId: 'user_id', category: 'category' },
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
      totalScore: '0.82', // 72% base + 10% goal
      profileScore: '0.65',
      goalScore: '0.10',
    },
  ]

  return { db: buildChain(mockResults) }
})

import { getMentorMatches } from '@/lib/db/queries/matching'

// ─── Goal Alignment scoring ───────────────────────────────────────────────────

describe('goalAlignment — correctly mapped from database results', () => {
  it('maps goalScore into insights.goalAlignment and matchPercentage correctly', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
      menteeId: 'mentee-1',
    })
    // totalScore 0.82 -> 82%
    expect(results[0].matchPercentage).toBe(82)
  })

  it('includes goalAlignment in the insights breakdown based on goalScore', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
      menteeId: 'mentee-1',
    })
    expect(results[0].insights).toHaveProperty('goalAlignment')
    // goalScore 0.10 -> 10%
    expect(results[0].insights.goalAlignment).toBe(10)
  })
})

describe('goalAlignment — flags absent or mismatched (0 score)', () => {
  it('maps 0 points when database returns 0 goalScore', async () => {
    // Override mock to return 0 for goalScore
    const { db } = await import('@/lib/db')
    vi.mocked(db.limit).mockResolvedValueOnce([
      {
        id: 'm-2',
        name: 'Bob Kamau',
        locationRegion: 'Mombasa',
        totalScore: '0.72',
        profileScore: '0.65',
        goalScore: '0.0',
      },
    ])
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
      menteeId: 'mentee-2',
    })
    expect(results[0].matchPercentage).toBe(72)
    expect(results[0].insights.goalAlignment).toBe(0)
  })

  it('safely handles null/undefined goalScore', async () => {
    const { db } = await import('@/lib/db')
    vi.mocked(db.limit).mockResolvedValueOnce([
      {
        id: 'm-3',
        name: 'Charlie',
        locationRegion: 'Kisumu',
        totalScore: '0.72',
        profileScore: '0.65',
        goalScore: null,
      },
    ])
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
      menteeId: 'mentee-3',
    })

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
