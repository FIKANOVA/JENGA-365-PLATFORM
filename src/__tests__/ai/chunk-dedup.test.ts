import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDelete = vi.hoisted(() => vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })))
const mockInsert = vi.hoisted(() => vi.fn(() => ({ values: vi.fn().mockResolvedValue([]) })))
const mockUpdate = vi.hoisted(() => vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) })))
const mockTransaction = vi.hoisted(() => vi.fn(async (cb: any) => cb({
  delete: mockDelete,
  insert: mockInsert,
})))

vi.mock('@/lib/db', () => ({
  db: {
    query: { users: { findFirst: vi.fn() } },
    select: vi.fn(() => ({ from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([
      { id: 'asset-1', userId: 'u-1', type: 'CV', url: 'http://example.com/cv.pdf' }
    ]) }) })),
    update: mockUpdate,
    transaction: mockTransaction,
  },
}))
vi.mock('@/lib/db/schema', () => ({
  users: { name: 'users' },
  userProfileAssets: { name: 'user_profile_assets' },
  userChunks: { name: 'user_chunks' },
}))
vi.mock('@/lib/ai/embeddings', () => ({
  generateProfileEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
}))
vi.mock('@ai-sdk/google', () => ({ google: vi.fn(() => 'model') }))
vi.mock('ai', () => ({ generateText: vi.fn().mockResolvedValue({ text: 'profile summary' }) }))
vi.mock('pdf-parse', () => ({ default: vi.fn().mockResolvedValue({ text: 'Software engineer with 10 years of experience in TypeScript and React. Led multiple teams and shipped production systems at scale.' }) }))
vi.mock('drizzle-orm', () => ({ eq: vi.fn(() => 'eq') }))

import { synthesizeUserProfile } from '@/lib/ai/profileSynthesizer'
import { db } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(db.query.users.findFirst).mockResolvedValue({
    id: 'u-1', name: 'Test', embedding: null, embeddingStale: true,
  } as any)
  // Re-wire transaction after clearAllMocks
  mockTransaction.mockImplementation(async (cb: any) => cb({
    delete: mockDelete,
    insert: mockInsert,
  }))
  // Mock global fetch for CV PDF download
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
  }))
})

describe('chunk deduplication', () => {
  it('deletes existing chunks before inserting new ones', async () => {
    await synthesizeUserProfile('u-1')
    expect(mockDelete).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalled()
  })

  it('delete is called before insert (ordering)', async () => {
    const callOrder: string[] = []
    mockDelete.mockImplementation(() => { callOrder.push('delete'); return { where: vi.fn().mockResolvedValue([]) } })
    mockInsert.mockImplementation(() => { callOrder.push('insert'); return { values: vi.fn().mockResolvedValue([]) } })

    await synthesizeUserProfile('u-1')

    const deleteIdx = callOrder.indexOf('delete')
    const insertIdx = callOrder.indexOf('insert')
    expect(deleteIdx).toBeGreaterThanOrEqual(0)
    expect(insertIdx).toBeGreaterThan(deleteIdx)
  })
})
