import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockUpdate, mockReturning } = vi.hoisted(() => {
  const mockReturning = vi.fn()
  const mockUpdate = vi.fn()
  return { mockUpdate, mockReturning }
})

vi.mock('@/lib/db', () => ({
  db: {
    query: { merchandise: { findFirst: vi.fn() } },
    update: mockUpdate,
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue([]) })),
  },
}))
vi.mock('@/lib/db/schema', () => ({
  merchandise: { name: 'merchandise', stockCount: 'stockCount', sanityProductId: 'sanityProductId', isActive: 'isActive' },
}))
vi.mock('@/lib/auth/config', () => ({
  auth: { api: { getSession: vi.fn().mockResolvedValue({ user: { id: 'u-1', role: 'SuperAdmin' } }) } },
}))
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Map()) }))
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(() => 'eq'),
  and: vi.fn(() => 'and'),
  gt: vi.fn(() => 'gt'),
  sql: vi.fn((s) => ({ sql: s })),
}))

import { decrementStock } from '@/lib/actions/merchandise'

beforeEach(() => {
  vi.clearAllMocks()
  mockReturning.mockResolvedValue([{ id: 'merch-1', stockCount: 0 }])
  mockUpdate.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({ returning: mockReturning }),
    }),
  })
})

describe('decrementStock — atomic update', () => {
  it('uses a single UPDATE with WHERE stock_count > 0 (no read-then-write)', async () => {
    await decrementStock('product-123')
    expect(mockUpdate).toHaveBeenCalledTimes(1)
    const { db } = await import('@/lib/db')
    expect(db.query.merchandise.findFirst).not.toHaveBeenCalled()
  })

  it('throws OUT_OF_STOCK when returning is empty (stock was 0)', async () => {
    mockReturning.mockResolvedValue([])
    await expect(decrementStock('product-123')).rejects.toThrow('OUT_OF_STOCK')
  })

  it('returns the updated record on success', async () => {
    const result = await decrementStock('product-123')
    expect(result).toMatchObject({ id: 'merch-1', stockCount: 0 })
  })
})
