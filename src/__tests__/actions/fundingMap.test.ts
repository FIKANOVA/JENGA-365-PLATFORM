import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getFundingMapData } from '@/lib/actions/fundingMap'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth/config'

// Mock dependencies
vi.mock('@/lib/db/schema', () => ({
  projectLocations: {
    id: 'projectLocations.id',
    name: 'projectLocations.name',
    latitude: 'projectLocations.latitude',
    longitude: 'projectLocations.longitude',
    projectType: 'projectLocations.projectType',
    amountFunded: 'projectLocations.amountFunded',
    youthReached: 'projectLocations.youthReached',
    startDate: 'projectLocations.startDate',
    description: 'projectLocations.description',
    funderId: 'projectLocations.funderId',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ type: 'eq', col, val })),
  and: vi.fn((...args) => ({ type: 'and', args })),
  gte: vi.fn((col, val) => ({ type: 'gte', col, val })),
  lte: vi.fn((col, val) => ({ type: 'lte', col, val })),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

describe('getFundingMapData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setupSelectMock(results: any[] = []) {
    const where = vi.fn().mockResolvedValue(results)
    const from = vi.fn().mockReturnValue({ where })
    vi.mocked(db.select).mockReturnValue({ from } as any)
    return { where, from }
  }

  it('throws UNAUTHENTICATED when session is null', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)

    await expect(getFundingMapData({ timeFilter: 'all' })).rejects.toThrow('UNAUTHENTICATED')
  })

  it('throws ZodError on invalid filters', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: 'user-1' },
    } as any)

    await expect(getFundingMapData({} as any)).rejects.toThrow()
  })

  it('returns empty array if user is CorporatePartner but has no partnerId', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: 'user-1', role: 'CorporatePartner' },
    } as any)

    setupSelectMock([])

    const result = await getFundingMapData({ timeFilter: 'all' })
    expect(result).toEqual({ type: 'FeatureCollection', features: [] })
  })

  it('filters by partnerId if user is CorporatePartner and has partnerId', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: 'user-1', role: 'CorporatePartner', partnerId: 'partner-123' },
    } as any)

    const { where } = setupSelectMock([])

    await getFundingMapData({ timeFilter: 'all' })

    expect(db.select).toHaveBeenCalledOnce()
    const { eq } = await import('drizzle-orm')
    expect(eq).toHaveBeenCalledWith('projectLocations.funderId', 'partner-123')
  })

  it('filters by startDate and endDate', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: 'user-1' },
    } as any)

    const { where } = setupSelectMock([])

    const startDate = new Date('2024-01-01')
    const endDate = new Date('2024-12-31')
    await getFundingMapData({ timeFilter: 'all', startDate, endDate })

    expect(db.select).toHaveBeenCalledOnce()
    const { gte, lte } = await import('drizzle-orm')
    expect(gte).toHaveBeenCalledWith('projectLocations.startDate', startDate)
    expect(lte).toHaveBeenCalledWith('projectLocations.startDate', endDate)
  })

  it('transforms DB results into valid GeoJSON FeatureCollection', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      user: { id: 'user-1' },
    } as any)

    const mockDate = new Date('2024-05-20T10:00:00.000Z')
    const mockDBResults = [
      {
        id: 'loc-1',
        name: 'Clinic 1',
        longitude: '-122.4194',
        latitude: '37.7749',
        projectType: 'clinic',
        amountFunded: '5000',
        youthReached: 100,
        startDate: mockDate,
        description: 'A great clinic',
        funderId: 'funder-1'
      }
    ]

    setupSelectMock(mockDBResults)

    const result = await getFundingMapData({ timeFilter: 'all' })

    expect(result).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749],
          },
          properties: {
            id: 'loc-1',
            name: 'Clinic 1',
            projectType: 'clinic',
            amount: '5000',
            youthReached: 100,
            date: '2024-05-20',
            description: 'A great clinic',
          },
        },
      ],
    })
  })
})
