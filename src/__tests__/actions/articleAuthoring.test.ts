import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@/lib/db/schema', () => ({
  articles: {
    id: 'id',
    authorId: 'author_id',
    title: 'title',
    slug: 'slug',
    excerpt: 'excerpt',
    bodyPortableText: 'body_portable_text',
    category: 'category',
    tags: 'tags',
    status: 'status',
    wordCount: 'word_count',
    readTimeMinutes: 'read_time_minutes',
    coverImageUrl: 'cover_image_url',
    coverImageAlt: 'cover_image_alt',
    coAuthorIds: 'co_author_ids',
    isFeatured: 'is_featured',
    deletedAt: 'deleted_at',
  },
  users: {
    id: 'id',
    email: 'email',
  },
  articleCategoryEnum: {
    enumValues: ['tech', 'career', 'community']
  }
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col, val) => ({ eq: val })),
  and: vi.fn((...args) => args),
  isNull: vi.fn((_col) => ({ isNull: true })),
  inArray: vi.fn((_col, val) => ({ inArray: val })),
}))

const mockInsertValues = vi.fn().mockReturnValue({
  returning: vi.fn().mockResolvedValue([{ id: 'new-article-123' }])
});

vi.mock('@/lib/db', () => {
  return {
    db: {
      query: {
        articles: {
          findFirst: vi.fn(),
        }
      },
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([])
        })
      }),
      insert: vi.fn().mockImplementation(() => ({
        values: mockInsertValues
      })),
      update: vi.fn(),
    },
  }
})

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock('@/lib/auth/config', () => {
  return {
    auth: {
      api: {
        getSession: vi.fn(),
      },
    },
  }
})

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/sanity/writeClient', () => ({
  sanityWriteClient: {
    assets: {
      upload: vi.fn(),
    }
  }
}))

vi.mock('@/lib/sanity/syncArticle', () => ({
  publishArticleToSanity: vi.fn(),
}))

vi.mock('@/lib/sanity/markdownPortable', () => ({
  markdownToPortable: vi.fn().mockReturnValue([{ _type: 'block', text: 'mocked content' }])
}))

import { createArticleDraft } from '@/lib/actions/articleAuthoring'
import { db } from '@/lib/db'

describe('createArticleDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws UNAUTHORIZED if no session exists', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)
    await expect(createArticleDraft({
      title: 'Test',
      excerpt: 'Test excerpt',
      body: 'Body',
      category: 'tech' as any,
      tags: [],
    })).rejects.toThrow('UNAUTHORIZED')
  })

  it('throws FORBIDDEN if user role is not allowed', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'u1', role: 'Guest' } } as any)
    await expect(createArticleDraft({
      title: 'Test',
      excerpt: 'Test excerpt',
      body: 'Body',
      category: 'tech' as any,
      tags: [],
    })).rejects.toThrow('FORBIDDEN')
  })

  it('creates draft for Mentor and ignores isFeatured=true', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mentor-1', role: 'Mentor' } } as any)
    // No collision
    vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(undefined)

    const result = await createArticleDraft({
      title: 'Mentor Article',
      excerpt: 'Some excerpt',
      body: 'This is the body. It has several words to test word count.',
      category: 'tech' as any,
      tags: ['mentor', 'test'],
      isFeatured: true, // Should be ignored
    })

    expect(result.id).toBe('new-article-123')
    expect(result.slug).toBe('mentor-article')

    const dbModule = await import('@/lib/db')
    const insertMock = vi.mocked(dbModule.db.insert)
    const valuesMock = insertMock({} as any).values as any

    expect(valuesMock).toHaveBeenCalledWith(expect.objectContaining({
      authorId: 'mentor-1',
      title: 'Mentor Article',
      slug: 'mentor-article',
      status: 'draft',
      isFeatured: false, // Must be false for non-privileged
    }))
  })

  it('creates draft for Moderator and honors isFeatured=true', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'mod-1', role: 'Moderator' } } as any)
    // No collision
    vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(undefined)

    await createArticleDraft({
      title: 'Mod Article',
      excerpt: 'Excerpt here',
      body: 'Body text.',
      category: 'community' as any,
      tags: [],
      isFeatured: true,
    })

    const dbModule = await import('@/lib/db')
    const insertMock = vi.mocked(dbModule.db.insert)
    const valuesMock = insertMock({} as any).values as any

    expect(valuesMock).toHaveBeenCalledWith(expect.objectContaining({
      authorId: 'mod-1',
      isFeatured: true, // Honored for privileged
    }))
  })

  it('resolves unique slug on collision', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: { id: 'u1', role: 'Mentee' } } as any)

    // 1st check: collision
    vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce({ id: 'existing-id' })
    // 2nd check: no collision
    vi.mocked(db.query.articles.findFirst).mockResolvedValueOnce(undefined)

    const result = await createArticleDraft({
      title: 'My Cool Title',
      excerpt: 'Excerpt',
      body: 'Body',
      category: 'career' as any,
      tags: [],
    })

    expect(result.slug).toBe('my-cool-title-2')
    const dbModule = await import('@/lib/db')
    const insertMock = vi.mocked(dbModule.db.insert)
    const valuesMock = insertMock({} as any).values as any

    expect(valuesMock).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'my-cool-title-2',
    }))
  })
})
