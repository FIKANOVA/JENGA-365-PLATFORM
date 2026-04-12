import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@/lib/db/schema', () => ({
  giveBackTracking: {
    id: 'id',
    userId: 'user_id',
    quarter: 'quarter',
    activityCompleted: 'activity_completed',
    strikeCount: 'strike_count',
  },
  users: {
    id: 'id',
    role: 'role',
    status: 'status',
    isApproved: 'is_approved',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col, val) => ({ eq: val })),
  and: vi.fn((...args) => args),
  count: vi.fn(() => 'count_expr'),
  sql: vi.fn(() => 'sql_expr'),
}))

vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}))

import { GET, getPreviousQuarter } from '@/app/api/cron/three-strikes/route'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications/service'

// ─── Constants ────────────────────────────────────────────────────────────────
const CRON_SECRET = 'test-cron-secret'

function makeRequest(authHeader?: string): Request {
  const headers = new Headers()
  if (authHeader !== undefined) headers.set('authorization', authHeader)
  return new Request('http://localhost/api/cron/three-strikes', { headers })
}

// ─── getPreviousQuarter helper ────────────────────────────────────────────────
describe('getPreviousQuarter', () => {
  it('returns Q4 of previous year when called in Q1 (January)', () => {
    expect(getPreviousQuarter(new Date('2026-01-01'))).toBe('2025-Q4')
  })
  it('returns Q1 of same year when called in Q2 (April)', () => {
    expect(getPreviousQuarter(new Date('2026-04-01'))).toBe('2026-Q1')
  })
  it('returns Q2 of same year when called in Q3 (July)', () => {
    expect(getPreviousQuarter(new Date('2026-07-01'))).toBe('2026-Q2')
  })
  it('returns Q3 of same year when called in Q4 (October)', () => {
    expect(getPreviousQuarter(new Date('2026-10-01'))).toBe('2026-Q3')
  })
})

// ─── Auth guard ───────────────────────────────────────────────────────────────
describe('Three Strikes cron — auth guard', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = CRON_SECRET
    vi.clearAllMocks()
    // Provide a no-mentees response so the cron body doesn't error
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
    } as any)
  })
  afterEach(() => { delete process.env.CRON_SECRET })

  it('returns 401 when Authorization header is missing', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when Authorization header has wrong secret', async () => {
    const res = await GET(makeRequest('Bearer wrong-secret'))
    expect(res.status).toBe(401)
  })

  it('returns 200 with correct secret', async () => {
    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(200)
  })
})

// ─── Strike logic ─────────────────────────────────────────────────────────────

/**
 * Wire up the DB call sequence for the Three Strikes cron.
 *
 * Select call order:
 *   Call 1                — fetch all active mentees
 *   Per CLEAN mentee      — 1 select (completed check → returns row → skip)
 *   Per FAILING mentee    — 2 selects (completed check → empty; failed count)
 *
 * Insert + update happen only for failing mentees.
 */
function setupStrikeScenario(
  mentees: { id: string; completedThisQuarter: boolean; totalFailedQuarters: number }[]
) {
  const menteeRows = mentees.map((m) => ({ id: m.id }))

  const mockWhere = vi.fn().mockResolvedValue([])
  const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
  vi.mocked(db.update).mockReturnValue({ set: mockSet } as any)

  const mockInsertValues = vi.fn().mockResolvedValue([])
  vi.mocked(db.insert).mockReturnValue({ values: mockInsertValues } as any)

  // Build the exact ordered response sequence for db.select calls
  // Each entry is the value the full chain resolves to for that call
  type SelectResponse =
    | { kind: 'mentees'; rows: { id: string }[] }
    | { kind: 'completed'; row: { id: string } | null }
    | { kind: 'failedCount'; count: number }

  const sequence: SelectResponse[] = [{ kind: 'mentees', rows: menteeRows }]

  for (const mentee of mentees) {
    if (mentee.completedThisQuarter) {
      sequence.push({ kind: 'completed', row: { id: 'tracking-row' } })
      // Clean mentee — no further calls
    } else {
      sequence.push({ kind: 'completed', row: null })
      sequence.push({ kind: 'failedCount', count: mentee.totalFailedQuarters })
    }
  }

  let callIndex = 0
  vi.mocked(db.select).mockImplementation(() => {
    const entry = sequence[callIndex++]

    if (entry?.kind === 'mentees') {
      return {
        from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(entry.rows) }),
      } as any
    }

    if (entry?.kind === 'completed') {
      const result = entry.row ? [entry.row] : []
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue(result) }),
        }),
      } as any
    }

    // failedCount
    return {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ failedCount: (entry as any)?.count ?? 0 }]),
      }),
    } as any
  })

  return { mockSet, mockInsertValues }
}

describe('Three Strikes cron — strike logic', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = CRON_SECRET
    vi.clearAllMocks()
  })
  afterEach(() => { delete process.env.CRON_SECRET })

  it('does NOT penalise a mentee who completed their give-back activity', async () => {
    setupStrikeScenario([{ id: 'mentee-1', completedThisQuarter: true, totalFailedQuarters: 0 }])
    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(200)
    expect(db.update).not.toHaveBeenCalled()
    expect(createNotification).not.toHaveBeenCalled()
  })

  it('sends a warning notification when strikeCount is 1 (first miss)', async () => {
    setupStrikeScenario([{ id: 'mentee-2', completedThisQuarter: false, totalFailedQuarters: 0 }])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    // strikeCount becomes 1 — warning, not under_review
    expect(createNotification).toHaveBeenCalledWith(
      'mentee-2',
      'general',
      expect.objectContaining({ title: expect.stringContaining('Give Back') }),
    )
    expect(db.update).not.toHaveBeenCalled() // no status change yet
  })

  it('sends a warning notification when strikeCount is 2 (second miss)', async () => {
    setupStrikeScenario([{ id: 'mentee-3', completedThisQuarter: false, totalFailedQuarters: 1 }])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(createNotification).toHaveBeenCalledOnce()
    expect(db.update).not.toHaveBeenCalled()
  })

  it('sets user status to under_review when strikeCount reaches 3', async () => {
    const { mockSet } = setupStrikeScenario([
      { id: 'mentee-4', completedThisQuarter: false, totalFailedQuarters: 2 },
    ])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(db.update).toHaveBeenCalledOnce()
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ status: 'under_review' }))
  })

  it('does NOT send a warning notification when user is flagged under_review', async () => {
    setupStrikeScenario([{ id: 'mentee-5', completedThisQuarter: false, totalFailedQuarters: 2 }])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(createNotification).not.toHaveBeenCalled()
  })

  it('inserts a give_back_tracking row for the failed quarter', async () => {
    const { mockInsertValues } = setupStrikeScenario([
      { id: 'mentee-6', completedThisQuarter: false, totalFailedQuarters: 0 },
    ])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(db.insert).toHaveBeenCalledOnce()
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'mentee-6', activityCompleted: false }),
    )
  })

  it('handles multiple mentees independently — one clean, one flagged', async () => {
    setupStrikeScenario([
      { id: 'clean-mentee', completedThisQuarter: true, totalFailedQuarters: 0 },
      { id: 'flagged-mentee', completedThisQuarter: false, totalFailedQuarters: 2 },
    ])
    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(200)
    expect(db.update).toHaveBeenCalledOnce() // only the flagged mentee
  })
})
