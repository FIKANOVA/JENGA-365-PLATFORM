import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  notifications: { id: 'id' },
  mentorCommitmentTracker: { id: 'id', mentorId: 'mentor_id', month: 'month', hoursLogged: 'hours_logged', status: 'status' },
  users: { id: 'id', role: 'role', status: 'status', isApproved: 'is_approved' },
}))

vi.mock('drizzle-orm', () => ({
  inArray: vi.fn((_col, vals) => ({ inArray: vals })),
  eq: vi.fn((_col, val) => ({ eq: val })),
  and: vi.fn((...args) => args),
}))

vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
  createNotifications: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/db', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}))

import { GET, getPreviousMonth } from '@/app/api/cron/power-hour-check/route'
import { db } from '@/lib/db'
import { createNotifications } from '@/lib/notifications/service'

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
  const mockValues = vi.fn().mockReturnValue([])
  vi.mocked(db.insert).mockImplementation(() => ({ values: mockValues }) as any)

  let call = 0
  vi.mocked(db.select).mockImplementation(() => {
    call++
    if (call === 1) {
      return { from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(mentors.map((m) => ({ id: m.id }))) }) } as any
    }
    if (call === 2) {
      const rows = mentors.flatMap(m => m.tracker ? [{ mentorId: m.id, id: 'tracker-1', ...m.tracker }] : []);
      return { from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(rows) }) } as any
    }
    return { from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) } as any
  })

  return { mockSet, mockValues }
}

describe('Power Hour cron — compliance logic', () => {
  beforeEach(() => { process.env.CRON_SECRET = CRON_SECRET; vi.clearAllMocks() })
  afterEach(() => { delete process.env.CRON_SECRET })

  it('sets status=failed and notifies when hoursLogged < 60', async () => {
    const { mockSet } = setupComplianceScenario([{ id: 'm-1', tracker: { hoursLogged: 45 } }])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(mockSet).toHaveBeenCalledWith({ status: 'failed' })
    expect(db.insert).not.toHaveBeenCalled() // we updated via db.update
    expect(createNotifications).toHaveBeenCalledOnce()

    const calls = vi.mocked(createNotifications).mock.calls[0][0];
    const notificationValues = calls.find((v: any) => v.type === 'general');
    expect(notificationValues).toBeDefined()
  })

  it('does NOT update or notify when hoursLogged >= 60 (already met)', async () => {
    setupComplianceScenario([{ id: 'm-1', tracker: { hoursLogged: 60 } }])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(db.update).not.toHaveBeenCalled()
    expect(db.insert).not.toHaveBeenCalled()
    expect(createNotifications).not.toHaveBeenCalled()
  })

  it('inserts a failed row with hoursLogged=0 when no tracker exists', async () => {
    const { mockValues } = setupComplianceScenario([{ id: 'm-1', tracker: null }])
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    // One for tracker
    expect(db.insert).toHaveBeenCalledTimes(1)

    const calls = mockValues.mock.calls.map(c => c[0]);
    const trackerValues = calls.flat().find((v: any) => v.status === 'failed' && v.hoursLogged === 0);
    expect(trackerValues).toBeDefined()

    expect(createNotifications).toHaveBeenCalledOnce()
    const notificationCalls = vi.mocked(createNotifications).mock.calls[0][0];
    const notificationValues = notificationCalls.find((v: any) => v.type === 'general');
    expect(notificationValues).toBeDefined()
  })
})
