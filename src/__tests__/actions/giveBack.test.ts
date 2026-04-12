import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  giveBackTracking: {
    id: 'id', userId: 'user_id', quarter: 'quarter',
    activityCompleted: 'activity_completed',
  },
  activityLog: { id: 'id', userId: 'user_id', actionType: 'action_type' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_c, v) => ({ eq: v })),
  and: vi.fn((...a) => a),
}))

vi.mock('@/lib/db', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: { getSession: vi.fn().mockResolvedValue({ user: { id: 'u-1' } }) },
  },
}))

import { logGiveBackActivity, getGiveBackStatus } from '@/lib/actions/giveBack'
import { db } from '@/lib/db'

function setupInsert() {
  const returning = vi.fn().mockResolvedValue([{ id: 'gb-1' }])
  const values = vi.fn().mockReturnValue({ returning })
  vi.mocked(db.insert).mockReturnValue({ values } as any)
  return { values, returning }
}

describe('logGiveBackActivity', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('throws UNAUTHORIZED when session is null', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)
    await expect(logGiveBackActivity({ quarter: '2026-Q2', activityType: 'tree_planting', description: 'planted 10 trees' }))
      .rejects.toThrow('UNAUTHORIZED')
  })

  it('inserts a give_back_tracking row with activityCompleted=true', async () => {
    const { values } = setupInsert()
    await logGiveBackActivity({ quarter: '2026-Q2', activityType: 'tree_planting', description: 'planted 10 trees' })
    expect(db.insert).toHaveBeenCalledOnce()
    expect(values.mock.calls[0][0].activityCompleted).toBe(true)
  })

  it('includes the correct quarter in the insert', async () => {
    const { values } = setupInsert()
    await logGiveBackActivity({ quarter: '2026-Q2', activityType: 'book_drive', description: 'donated books' })
    expect(values.mock.calls[0][0].quarter).toBe('2026-Q2')
  })
})

describe('getGiveBackStatus', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns the give_back_tracking row for the given quarter', async () => {
    const mockRow = { id: 'gb-1', userId: 'u-1', quarter: '2026-Q2', activityCompleted: true }
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([mockRow]) }),
      }),
    } as any)
    const result = await getGiveBackStatus('2026-Q2')
    expect(result).toEqual(mockRow)
  })

  it('returns null when no record found', async () => {
    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
      }),
    } as any)
    const result = await getGiveBackStatus('2026-Q1')
    expect(result).toBeNull()
  })
})
