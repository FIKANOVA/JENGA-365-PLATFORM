import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getGlobalImpactStats, getPartnerLogos, getLatestInsights } from '@/lib/actions/marketing'
import { db } from '@/lib/db'

vi.mock('@/lib/db/schema', () => ({
  users: { role: 'role', isApproved: 'isApproved', status: 'status' },
  vPublicImpactAggregate: 'vPublicImpactAggregate',
  corporatePartners: { isActive: 'isActive' },
  articles: { status: 'status', publishedAt: 'publishedAt' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  count: vi.fn(),
  desc: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    query: {
      corporatePartners: { findMany: vi.fn() },
      articles: { findMany: vi.fn() }
    }
  }
}))

describe('getGlobalImpactStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns impact stats successfully', async () => {
    const mockRow = {
      treesPlantedTotal: 100,
      treesAliveLatestAudit: 90,
      survivalRatePct: 90,
      mentorshipHoursTotal: 500,
      youthEngagedActive: 50,
      activeCorporatePartners: 10,
      activeNgoPartners: 5,
    }
    const mockMentorsRow = { count: 20 }

    vi.mocked(db.select).mockImplementation((args) => {
      if (!args) {
        return {
          from: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRow])
          })
        } as any;
      } else {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([mockMentorsRow])
          })
        } as any;
      }
    });

    const result = await getGlobalImpactStats()
    expect(result).toEqual({
      treesPlantedTotal: 100,
      treesAliveLatestAudit: 90,
      survivalRatePct: 90,
      mentorshipHoursTotal: 500,
      youthEngagedActive: 50,
      activeCorporatePartners: 10,
      activeNgoPartners: 5,
      activeMentors: 20,
    })
  })

  it('returns null when no rows from vPublicImpactAggregate', async () => {
    vi.mocked(db.select).mockImplementation((args) => {
      if (!args) {
        return {
          from: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        } as any;
      } else {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 20 }])
          })
        } as any;
      }
    });

    const result = await getGlobalImpactStats()
    expect(result).toBeNull()
  })

  it('handles database errors gracefully and returns null', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(db.select).mockImplementation(() => {
      throw new Error('Database error')
    });

    const result = await getGlobalImpactStats()
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch impact stats:", expect.any(Error))

    consoleSpy.mockRestore()
  })
})

describe('getPartnerLogos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns active corporate partners successfully', async () => {
    const mockPartners = [
      { id: '1', name: 'Partner 1', logoUrl: 'logo1.png' },
      { id: '2', name: 'Partner 2', logoUrl: 'logo2.png' }
    ]

    vi.mocked(db.query.corporatePartners.findMany).mockResolvedValue(mockPartners as any)

    const result = await getPartnerLogos()

    expect(result).toEqual(mockPartners)
    expect(db.query.corporatePartners.findMany).toHaveBeenCalledWith({
      where: undefined, // this would be the eq(...) return value
      limit: 10
    })
  })

  it('handles database errors gracefully and returns empty array', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(db.query.corporatePartners.findMany).mockRejectedValue(new Error('Database error'))

    const result = await getPartnerLogos()

    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch partner logos:", expect.any(Error))

    consoleSpy.mockRestore()
  })
})

describe('getLatestInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns latest published insights successfully', async () => {
    const mockArticles = [
      { id: '1', title: 'Insight 1' },
      { id: '2', title: 'Insight 2' },
      { id: '3', title: 'Insight 3' }
    ]

    vi.mocked(db.query.articles.findMany).mockResolvedValue(mockArticles as any)

    const result = await getLatestInsights()

    expect(result).toEqual(mockArticles)
    expect(db.query.articles.findMany).toHaveBeenCalledWith({
      where: undefined, // eq(...) return value
      orderBy: [undefined], // desc(...) return value
      limit: 3
    })
  })

  it('handles database errors gracefully and returns empty array', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(db.query.articles.findMany).mockRejectedValue(new Error('Database error'))

    const result = await getLatestInsights()

    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch latest insights:", expect.any(Error))

    consoleSpy.mockRestore()
  })
})
