import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  powerHourSessions: { id: 'id', mentorId: 'mentor_id' },
  mentorCommitmentTracker: {
    id: 'id',
    mentorId: 'mentor_id',
    month: 'month',
    hoursLogged: 'hours_logged',
    status: 'status',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col, val) => ({ eq: val })),
  and: vi.fn((...args) => args),
  sql: vi.fn((s) => s),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}))

import { logPowerHourSession, getMonthlyCommitmentStatus } from '@/lib/actions/powerHour'
import { db } from '@/lib/db'

function setupInsertMock(sessionId: string) {
  const mockOnConflict = vi.fn().mockResolvedValue([])
  const mockReturning = vi.fn().mockResolvedValue([{ id: sessionId }])
  const mockValues = vi.fn()
    .mockReturnValueOnce({ returning: mockReturning })   // first insert (session)
    .mockReturnValueOnce({ onConflictDoUpdate: mockOnConflict }) // second insert (tracker)
  vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any)
  return { mockOnConflict }
}

describe('logPowerHourSession', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('inserts a session row', async () => {
    setupInsertMock('session-uuid')
    await logPowerHourSession({ mentorId: 'm-1', sessionDate: new Date(), durationMinutes: 30 })
    expect(db.insert).toHaveBeenCalled()
  })

  it('upserts the commitment tracker for the correct month', async () => {
    const { mockOnConflict } = setupInsertMock('session-uuid')
    const sessionDate = new Date('2026-04-10')
    const result = await logPowerHourSession({ mentorId: 'm-1', sessionDate, durationMinutes: 45 })
    expect(result.month).toBe('2026-04')
    expect(mockOnConflict).toHaveBeenCalledOnce()
  })

  it('returns sessionId from the inserted session row', async () => {
    setupInsertMock('session-uuid-999')
    const result = await logPowerHourSession({ mentorId: 'm-1', sessionDate: new Date(), durationMinutes: 20 })
    expect(result.sessionId).toBe('session-uuid-999')
  })
})

describe('getMonthlyCommitmentStatus', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns tracker row when found', async () => {
    const mockRow = { id: 'tracker-1', mentorId: 'm-1', month: '2026-04', hoursLogged: 75, status: 'met' }
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([mockRow]) }),
      }),
    } as any)
    const result = await getMonthlyCommitmentStatus('m-1', '2026-04')
    expect(result).toEqual(mockRow)
  })

  it('returns null when no tracker found', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
      }),
    } as any)
    const result = await getMonthlyCommitmentStatus('m-1', '2026-03')
    expect(result).toBeNull()
  })
})
