import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth/config', () => ({
  auth: { api: { getSession: vi.fn() } },
}))
vi.mock('@/lib/db', () => ({
  db: { query: { users: { findFirst: vi.fn() }, menteeIntake: { findFirst: vi.fn().mockResolvedValue(null) } } },
}))
vi.mock('@/lib/db/schema', () => ({ users: { name: 'users' }, menteeIntake: { userId: 'userId' } }))
vi.mock('@/lib/db/queries/matching', () => ({
  getMentorMatches: vi.fn().mockResolvedValue([{ id: 'mentor-1', matchPercentage: 85 }]),
}))
vi.mock('drizzle-orm', () => ({ eq: vi.fn(() => 'eq') }))
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Map()) }))

import { getAiMentorMatches } from '@/lib/actions/matching'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { getMentorMatches } from '@/lib/db/queries/matching'

const MOCK_EMBEDDING = new Array(768).fill(0.1)

describe('getAiMentorMatches', () => {
  beforeEach(() => vi.clearAllMocks())
  it('returns [] when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null as any)
    expect(await getAiMentorMatches()).toEqual([])
  })

  it('fetches embedding from DB, not session', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u-1' } } as any)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ embedding: MOCK_EMBEDDING, embeddingStale: false } as any)
    await getAiMentorMatches()
    expect(db.query.users.findFirst).toHaveBeenCalled()
    expect(getMentorMatches).toHaveBeenCalledWith(expect.objectContaining({ menteeEmbedding: MOCK_EMBEDDING }))
  })

  it('returns [] when user has no embedding in DB', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u-1' } } as any)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ embedding: null, embeddingStale: false } as any)
    expect(await getAiMentorMatches()).toEqual([])
  })

  it('returns [] when embedding is stale', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u-1' } } as any)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ embedding: MOCK_EMBEDDING, embeddingStale: true } as any)
    expect(await getAiMentorMatches()).toEqual([])
  })

  it('forwards goalCategories to getMentorMatches when intake has categories', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u-1' } } as any)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ embedding: MOCK_EMBEDDING, embeddingStale: false } as any)
    vi.mocked(db.query.menteeIntake.findFirst).mockResolvedValue({ goalCategories: ['entrepreneurship'] } as any)
    await getAiMentorMatches()
    expect(getMentorMatches).toHaveBeenCalledWith(
      expect.objectContaining({ menteeGoalCategories: ['entrepreneurship'] })
    )
  })

  it('passes undefined menteeGoalCategories when intake goalCategories is null', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u-1' } } as any)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ embedding: MOCK_EMBEDDING, embeddingStale: false } as any)
    vi.mocked(db.query.menteeIntake.findFirst).mockResolvedValue({ goalCategories: null } as any)
    await getAiMentorMatches()
    expect(getMentorMatches).toHaveBeenCalledWith(
      expect.objectContaining({ menteeGoalCategories: undefined })
    )
  })

  it('passes undefined menteeGoalCategories when no intake row exists', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u-1' } } as any)
    vi.mocked(db.query.users.findFirst).mockResolvedValue({ embedding: MOCK_EMBEDDING, embeddingStale: false } as any)
    vi.mocked(db.query.menteeIntake.findFirst).mockResolvedValue(null as any)
    await getAiMentorMatches()
    expect(getMentorMatches).toHaveBeenCalledWith(
      expect.objectContaining({ menteeGoalCategories: undefined })
    )
  })
})
