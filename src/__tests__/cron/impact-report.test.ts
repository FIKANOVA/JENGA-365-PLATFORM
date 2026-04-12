import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock all external dependencies before importing the route handler
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}))

vi.mock('@/lib/db/schema', () => ({
  impactReports: { name: 'impact_reports' },
  donations: { name: 'donations' },
  sessionsLog: { name: 'sessions_log' },
}))

vi.mock('drizzle-orm', () => ({
  sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({ sql: strings, values })),
  sum: vi.fn((col: unknown) => col),
  count: vi.fn((col: unknown) => col),
}))

import { GET } from '@/app/api/cron/impact-report/route'
import { db } from '@/lib/db'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEST_CRON_SECRET = 'test-secret-abc'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(authHeader?: string): Request {
  const headers = new Headers()
  if (authHeader !== undefined) {
    headers.set('authorization', authHeader)
  }
  return new Request('http://localhost/api/cron/impact-report', { headers })
}

function setupDbMocks(donationAmount: string | null, sessionHours: number | null, sessionCount: number | null) {
  let callCount = 0
  vi.mocked(db.select).mockImplementation(() => {
    callCount++
    if (callCount === 1) {
      return { from: vi.fn().mockResolvedValue([{ totalAmount: donationAmount }]) } as any
    }
    return { from: vi.fn().mockResolvedValue([{ totalHours: sessionHours, youthCount: sessionCount }]) } as any
  })
  const mockValues = vi.fn().mockResolvedValue([])
  vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any)
  return { mockValues }
}

// ---------------------------------------------------------------------------
// BUG-01 — Auth guard
// ---------------------------------------------------------------------------

describe('BUG-01: auth guard', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = TEST_CRON_SECRET
    vi.clearAllMocks()
    // Provide DB mocks so the happy-path (200) test can run through without errors.
    // The 401 tests hit the auth guard first; these mocks are unused in that case.
    setupDbMocks('1000', 60, 5)
  })

  afterEach(() => {
    delete process.env.CRON_SECRET
  })

  it('returns 401 when Authorization header is missing', async () => {
    const req = makeRequest() // no auth header
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when Authorization header has wrong secret', async () => {
    const req = makeRequest('Bearer wrong-secret')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 when Authorization header has correct secret', async () => {
    const req = makeRequest(`Bearer ${TEST_CRON_SECRET}`)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// BUG-02 — SQL correctness
// ---------------------------------------------------------------------------

describe('BUG-02: SQL correctness', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = TEST_CRON_SECRET
    vi.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.CRON_SECRET
  })

  it('calls db.select twice — once for donations, once for sessions', async () => {
    setupDbMocks('5000', 360, 12)

    const req = makeRequest(`Bearer ${TEST_CRON_SECRET}`)
    await GET(req)

    expect(db.select).toHaveBeenCalledTimes(2)
  })

  it('inserts totalMentorshipHours: 360 when sessions query returns 360 minutes', async () => {
    const { mockValues } = setupDbMocks('5000.00', 360, 12)

    const req = makeRequest(`Bearer ${TEST_CRON_SECRET}`)
    await GET(req)

    const insertedRow = mockValues.mock.calls[0][0]
    expect(insertedRow.totalMentorshipHours).toBe(360)
  })

  it('inserts totalMentorshipHours: 0 and youthEngaged: 0 gracefully when sessions return nulls', async () => {
    const { mockValues } = setupDbMocks(null, null, null)

    const req = makeRequest(`Bearer ${TEST_CRON_SECRET}`)
    await GET(req)

    const insertedRow = mockValues.mock.calls[0][0]
    expect(insertedRow.totalMentorshipHours).toBe(0)
    expect(insertedRow.youthEngaged).toBe(0)
  })
})
