import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  users: {
    id: 'user_id',
    name: 'name',
    email: 'email',
    role: 'role',
    image: 'image',
    locationRegion: 'region',
    status: 'status',
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
  },
  mentorshipPairs: {
    mentorId: 'mentor_id',
    menteeId: 'mentee_id',
    status: 'status',
    matchedAt: 'matched_at',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col, val) => ({ eq: val })),
  and: vi.fn((...args) => args),
  or: vi.fn((...args) => args),
  desc: vi.fn((col) => col),
  ne: vi.fn((_col, val) => ({ ne: val })),
  sql: vi.fn((strings, ...values) => ({ sql: strings.join('?') })),
  isNull: vi.fn((col) => ({ isNull: col })),
  inArray: vi.fn((col, vals) => ({ inArray: vals })),
}))

vi.mock('drizzle-orm/pg-core', () => ({
  alias: vi.fn((table, name) => ({ ...table, alias: name })),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers()),
}))

const mockSession = {
  user: { id: 'u-1', role: 'Mentee' }
}

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn(async () => mockSession),
    },
  },
}))

vi.mock('@/lib/auth/roles', () => ({
  effectiveScopes: vi.fn((role, scopeString) => {
    if (role !== 'Moderator') return []
    try {
      const parsed = JSON.parse(scopeString || '[]')
      return parsed
    } catch {
      return []
    }
  }),
}))

let mockDbRows: any[] = []

vi.mock('@/lib/db', () => {
  const db = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  }
  // Mocking `then` so the chain resolves to the mock rows
  // Also mocking `catch` because some actions use it to suppress errors.
  const originalMockReturnThis = { ...db, then: (resolve: any) => resolve(mockDbRows), catch: vi.fn().mockImplementation(() => Promise.resolve(mockDbRows)) }
  db.select = vi.fn().mockReturnValue(originalMockReturnThis)
  db.limit = vi.fn().mockReturnValue(originalMockReturnThis)
  db.where = vi.fn().mockReturnValue(originalMockReturnThis)
  db.catch = vi.fn().mockImplementation((cb) => cb()) // for catch branch coverage
  return { db }
})

import { getMyDirectory } from '@/lib/actions/userSearch'

describe('getMyDirectory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDbRows = []
    mockSession.user = { id: 'u-1', role: 'Mentee' }
  })

  it('throws UNAUTHORIZED if no user session', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)

    await expect(getMyDirectory()).rejects.toThrow('UNAUTHORIZED')
  })

  // Mentee Role
  describe('Role: Mentee', () => {
    it('returns assigned mentors directory with empty subtitle when no mentors', async () => {
      mockSession.user = { id: 'm-1', role: 'Mentee' }
      mockDbRows = []

      const dir = await getMyDirectory()
      expect(dir.kind).toBe('assigned_mentors')
      expect(dir.entries).toHaveLength(0)
      expect(dir.subtitle).toContain('No mentor assigned yet')
    })

    it('returns empty directory on DB error', async () => {
      mockSession.user = { id: 'm-1', role: 'Mentee' }
      const { db } = await import('@/lib/db')
      vi.mocked(db.select).mockReturnValueOnce({
        ...db,
        catch: vi.fn().mockImplementation((cb) => cb(new Error('DB Error')))
      } as any)
      const dir = await getMyDirectory()
      expect(dir.kind).toBe('assigned_mentors')
      expect(dir.entries).toHaveLength(0)
    })

    it('returns assigned mentors directory with entries when mentors exist', async () => {
      mockSession.user = { id: 'm-1', role: 'Mentee' }
      mockDbRows = [
        { id: 'u-2', name: 'Mentor A', email: 'a@example.com', role: 'Mentor', region: 'NA', status: 'active', image: null }
      ]

      const dir = await getMyDirectory()
      expect(dir.kind).toBe('assigned_mentors')
      expect(dir.entries).toHaveLength(1)
      expect(dir.entries[0].name).toBe('Mentor A')
      expect(dir.entries[0].relationship).toBe('Your mentor')
    })
  })

  // Mentor Role
  describe('Role: Mentor', () => {
    it('returns assigned mentees directory with empty subtitle when no mentees', async () => {
      mockSession.user = { id: 'u-1', role: 'Mentor' }
      mockDbRows = []

      const dir = await getMyDirectory()
      expect(dir.kind).toBe('assigned_mentees')
      expect(dir.entries).toHaveLength(0)
      expect(dir.subtitle).toContain('No mentees assigned yet')
    })

    it('returns empty directory on DB error (Mentor)', async () => {
      mockSession.user = { id: 'm-1', role: 'Mentor' }
      const { db } = await import('@/lib/db')
      vi.mocked(db.select).mockReturnValueOnce({
        ...db,
        catch: vi.fn().mockImplementation((cb) => cb(new Error('DB Error')))
      } as any)
      const dir = await getMyDirectory()
      expect(dir.kind).toBe('assigned_mentees')
      expect(dir.entries).toHaveLength(0)
    })

    it('returns assigned mentees directory with entries when mentees exist', async () => {
      mockSession.user = { id: 'u-1', role: 'Mentor' }
      mockDbRows = [
        { id: 'm-1', name: null, email: 'mentee@example.com', role: 'Mentee', region: 'EU', status: 'pending', image: 'url' }
      ]

      const dir = await getMyDirectory()
      expect(dir.kind).toBe('assigned_mentees')
      expect(dir.entries).toHaveLength(1)
      expect(dir.entries[0].name).toBe('mentee@example.com') // Fallback to email
      expect(dir.entries[0].relationship).toBe('Your mentee')
      expect(dir.entries[0].status).toBe('pending')
    })
  })

  // Moderator Role
  describe('Role: Moderator', () => {
    it('returns moderation directory with entries for all scopes', async () => {
      mockSession.user = { id: 'mod-1', role: 'Moderator', moderationScope: '["all"]' } as any
      mockDbRows = [
        { id: 'u-2', name: 'User 2', email: '2@example.com', role: 'Mentee', region: null, status: 'active', image: null },
        { id: 'u-3', name: 'User 3', email: '3@example.com', role: 'CorporatePartner', region: null, status: 'active', image: null }
      ]

      const dir = await getMyDirectory()
      expect(dir.kind).toBe('moderation')
      expect(dir.entries).toHaveLength(2)
      expect(dir.entries[0].relationship).toBeNull()
    })

    it('returns empty moderation directory if no actionable scope', async () => {
      mockSession.user = { id: 'mod-1', role: 'Moderator', moderationScope: '["content"]' } as any
      // content scope doesn't add any allowed roles
      mockDbRows = []

      const dir = await getMyDirectory()
      expect(dir.kind).toBe('moderation')
      expect(dir.entries).toHaveLength(0)
      expect(dir.subtitle).toContain('No user categories in your scope')
    })

    it('returns moderation directory with specific scope (corporate)', async () => {
      mockSession.user = { id: 'mod-1', role: 'Moderator', moderationScope: '["corporate"]' } as any
      mockDbRows = [
        { id: 'u-3', name: 'Corp A', email: 'corpa@example.com', role: 'CorporatePartner', region: null, status: 'active', image: null }
      ]

      const dir = await getMyDirectory()
      expect(dir.kind).toBe('moderation')
      expect(dir.entries).toHaveLength(1)
    })
  })

  // Other Roles
  describe('Role: Other (e.g. SuperAdmin)', () => {
    it('returns none directory', async () => {
      mockSession.user = { id: 'admin-1', role: 'SuperAdmin' } as any

      const dir = await getMyDirectory()
      expect(dir.kind).toBe('none')
      expect(dir.entries).toHaveLength(0)
    })
  })
})

describe('searchUsersForCoAuthor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDbRows = []
    mockSession.user = { id: 'u-1', role: 'Mentee' }
  })

  it('returns empty array if query length < 2', async () => {
    const { searchUsersForCoAuthor } = await import('@/lib/actions/userSearch')
    const result = await searchUsersForCoAuthor('a')
    expect(result).toEqual([])
  })

  it('searches users based on query and returns results', async () => {
    mockDbRows = [
      { id: 'u-2', name: 'John Doe', email: 'john@example.com', role: 'Mentor', image: null }
    ]
    const { searchUsersForCoAuthor } = await import('@/lib/actions/userSearch')
    const result = await searchUsersForCoAuthor('john')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('John Doe')
    expect(result[0].email).toBe('john@example.com')
  })

  it('falls back to email for name if name is missing', async () => {
    mockDbRows = [
      { id: 'u-2', name: null, email: 'john@example.com', role: 'Mentor', image: null }
    ]
    const { searchUsersForCoAuthor } = await import('@/lib/actions/userSearch')
    const result = await searchUsersForCoAuthor('john')

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('john@example.com')
  })
})

describe('hydrateCoAuthors', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDbRows = []
    mockSession.user = { id: 'u-1', role: 'Mentee' }
  })

  it('returns empty array if ids is empty', async () => {
    const { hydrateCoAuthors } = await import('@/lib/actions/userSearch')
    const result = await hydrateCoAuthors([])
    expect(result).toEqual([])
  })

  it('hydrates users given ids', async () => {
    mockDbRows = [
      { id: 'u-2', name: 'Jane Doe', email: 'jane@example.com', role: 'Mentor', image: null }
    ]
    const { hydrateCoAuthors } = await import('@/lib/actions/userSearch')
    const result = await hydrateCoAuthors(['u-2'])

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Jane Doe')
  })

  it('falls back to email for name if name is missing', async () => {
    mockDbRows = [
      { id: 'u-2', name: null, email: 'jane@example.com', role: 'Mentor', image: null }
    ]
    const { hydrateCoAuthors } = await import('@/lib/actions/userSearch')
    const result = await hydrateCoAuthors(['u-2'])

    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('jane@example.com')
  })
})
