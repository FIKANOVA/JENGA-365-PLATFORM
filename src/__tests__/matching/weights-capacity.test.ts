import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', name: 'name', role: 'role', locationRegion: 'locationRegion', partnerId: 'partnerId', embedding: 'embedding', isApproved: 'isApproved', status: 'status' },
  userProfileAssets: { userId: 'userId', type: 'type' },
  mentorshipPairs: { mentorId: 'mentorId', status: 'status' },
}))

const makeSqlObj = () => {
  const obj: any = { sql: '', values: [] }
  obj.as = vi.fn(() => obj)
  obj.mapWith = vi.fn(() => obj)
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

// Reset mock to support chained calls for the main query
vi.mock('@/lib/db', () => {
  const buildChain = (finalValue: any) => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    as: vi.fn().mockReturnValue({ mentorId: 'mentorId', activeCount: 'activeCount', userId: 'userId', assetCount: 'assetCount' }),
    limit: vi.fn().mockResolvedValue(finalValue),
  })

  const mockResults = [
    { id: 'm-1', name: 'Alice', locationRegion: 'Nairobi', totalScore: '0.82', profileScore: '0.75' }
  ]

  const chain = buildChain(mockResults)
  return { db: chain }
})

import { getMentorMatches } from '@/lib/db/queries/matching'

describe('getMentorMatches', () => {
  it('accepts locationRegion and partnerId parameters', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
      locationRegion: 'Nairobi',
      partnerId: 'partner-uuid',
      limit: 5,
    })
    expect(Array.isArray(results)).toBe(true)
  })

  it('returns matchPercentage derived from totalScore', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
    })
    expect(results[0]).toHaveProperty('matchPercentage')
    expect(typeof results[0].matchPercentage).toBe('number')
  })

  it('does not return chunkScore in results (removed per spec)', async () => {
    const results = await getMentorMatches({
      menteeEmbedding: new Array(768).fill(0.1),
    })
    expect(results[0]).not.toHaveProperty('chunkScore')
  })
})
