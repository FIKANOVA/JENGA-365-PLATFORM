import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  mentorCommitmentTracker: { id: 'id', mentorId: 'mentor_id', month: 'month', hoursLogged: 'hours_logged', status: 'status' },
  users: { id: 'id', role: 'role', status: 'status', isApproved: 'is_approved' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col, val) => ({ eq: val })),
  and: vi.fn((...args) => args),
}))

vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/db', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}))

import { GET, getPreviousMonth } from '@/app/api/cron/power-hour-check/route'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications/service'

const CRON_SECRET = 'test-power-hour-secret'

function makeRequest(auth?: string): Request {
  const h = new Headers()
  if (auth) h.set('authorization', auth)
  return new Request('http://localhost/api/cron/power-hour-check', { headers: h })
}

// ─── getPreviousMonth helper ──────────────────────────────────────────────────
describe('getPreviousMonth', () => {
  it('returns previous year December when called in January', () => {
    expect(getPreviousMonth(new Date('2026-01-01'))).toBe('2025-12')
  })
  it('returns March when called in April', () => {
    expect(getPreviousMonth(new Date('2026-04-01'))).toBe('2026-03')
  })
  it('returns November when called in December', () => {
    expect(getPreviousMonth(new Date('2026-12-01'))).toBe('2026-11')
  })
})

// ─── Auth guard ───────────────────────────────────────────────────────────────
describe('Power Hour cron — auth guard', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = CRON_SECRET
    vi.clearAllMocks()
    vi.mocked(db.select).mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) } as any)
  })
  afterEach(() => { delete process.env.CRON_SECRET })

  it('returns 401 when Authorization header is missing', async () => {
    expect((await GET(makeRequest())).status).toBe(401)
  })

  it('returns 401 when Authorization header has wrong secret', async () => {
    expect((await GET(makeRequest('Bearer wrong'))).status).toBe(401)
  })

  it('returns 200 with correct secret', async () => {
    expect((await GET(makeRequest(`Bearer ${CRON_SECRET}`))).status).toBe(200)
  })
})

// ─── Compliance logic ─────────────────────────────────────────────────────────
function setupComplianceScenario(
  mentors: { id: string; tracker: { hoursLogged: number } | null }[]
) {
  const mockWhere = vi.fn().mockResolvedValue([])
  const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
  vi.mocked(db.update).mockReturnValue({ set: mockSet } as any)
  vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockResolvedValue([]) } as any)

  let call = 0
  vi.mocked(db.select).mockImplementation(() => {
    call++
    if (call === 1) {
      return { from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(mentors.map((m) => ({ id: m.id }))) }) } as any
    }
    const mentor = mentors[call - 2]
    const row = mentor?.tracker ? [{ id: 'tracker-1', ...mentor.tracker }] : []
    return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue(row) }) }) } as any
  })

  return { mockSet }
}

describe('Power Hour cron — compliance logic', () => {
  beforeEach(() => { process.env.CRON_SECRET = CRON_SECRET; vi.clearAllMocks() })
  afterEach(() => { delete process.env.CRON_SECRET })

  it('sets status=failed and notifies when hoursLogged < 60', async () => {
    const { mockSet } = setupComplianceScenario([{ id: 'm-1', tracker: { hoursLogged: 45 } }])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(mockSet).toHaveBeenCalledWith({ status: 'failed' })
    expect(createNotification).toHaveBeenCalledOnce()
  })

  it('does NOT update or notify when hoursLogged >= 60 (already met)', async () => {
    setupComplianceScenario([{ id: 'm-1', tracker: { hoursLogged: 60 } }])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(db.update).not.toHaveBeenCalled()
    expect(createNotification).not.toHaveBeenCalled()
  })

  it('inserts a failed row with hoursLogged=0 when no tracker exists', async () => {
    setupComplianceScenario([{ id: 'm-1', tracker: null }])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(db.insert).toHaveBeenCalledOnce()
    const valuesCall = vi.mocked(db.insert).mock.results[0].value.values.mock.calls[0][0]
    expect(valuesCall.hoursLogged).toBe(0)
    expect(valuesCall.status).toBe('failed')
    expect(createNotification).toHaveBeenCalledOnce()
  })
})
