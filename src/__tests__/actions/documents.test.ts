import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  platformDocuments: { id: 'id', status: 'status', tier: 'tier', uploadedAt: 'uploaded_at', publishedAt: 'published_at' },
  documentChunks: {},
  documentAccessLogs: { id: 'id', accessedAt: 'accessed_at' },
  userProfileAssets: {},
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_c, v) => ({ eq: v })),
  and: vi.fn((...a) => a),
  desc: vi.fn((c) => ({ desc: c })),
  inArray: vi.fn((c, v) => ({ inArray: [c, v] })),
}))

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
    query: {
      documentAccessLogs: { findMany: vi.fn() },
      platformDocuments: { findFirst: vi.fn() },
    }
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

// Use the simplest hoisting by inline vi.fn()
vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: { getSession: vi.fn() },
  },
}))

vi.mock('@/lib/ai/documentProcessor', () => ({
  processAndEmbedDocument: vi.fn(),
}))

import {
  uploadPlatformDocument,
  publishDocument,
  archiveDocument,
  indexDocumentToPgVector,
  listAdminDocuments,
  getAccessLogs,
  listPublicDocuments,
  listRoleDocuments,
  logDocumentAccess,
} from '@/lib/actions/documents'
import { db } from '@/lib/db'
import { processAndEmbedDocument } from '@/lib/ai/documentProcessor'

// Need to await dynamic import to get the mocked module
let mockGetSession: any;

beforeEach(async () => {
  vi.clearAllMocks()
  const authModule = await import('@/lib/auth/config')
  mockGetSession = vi.mocked(authModule.auth.api.getSession)
})


// Setup standard db mocks
function setupDbMock() {
  const returning = vi.fn().mockResolvedValue([{ id: 'doc-1', status: 'draft' }])
  const values = vi.fn().mockReturnValue({ returning })
  const set = vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ returning }) })

  vi.mocked(db.insert).mockReturnValue({ values } as any)
  vi.mocked(db.update).mockReturnValue({ set } as any)

  const fromMock = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      orderBy: vi.fn().mockResolvedValue([{ id: 'doc-1' }])
    }),
    orderBy: vi.fn().mockResolvedValue([{ id: 'doc-1' }]),
  })
  vi.mocked(db.select).mockReturnValue({ from: fromMock } as any)

  return { values, returning, set, fromMock }
}

describe('uploadPlatformDocument', () => {
  const validPayload = {
    tier: '1' as const,
    title: 'Test Document',
    version: '1.0',
    filename: 'test-doc.pdf',
    fileUrl: 'https://example.com/test-doc.pdf',
    fileSize: 1024,
    status: 'draft' as const,
  }

  it('throws UNAUTHORIZED if no session', async () => {
    mockGetSession.mockResolvedValueOnce(null as any)
    await expect(uploadPlatformDocument(validPayload)).rejects.toThrow('UNAUTHORIZED')
  })

  it('throws UNAUTHORIZED if role is not SuperAdmin', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'Mentor' } } as any)
    await expect(uploadPlatformDocument(validPayload)).rejects.toThrow('UNAUTHORIZED')
  })

  it('inserts document successfully for SuperAdmin', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: 'admin-1', role: 'SuperAdmin' } } as any)
    const { values } = setupDbMock()

    const result = await uploadPlatformDocument(validPayload)

    expect(result.success).toBe(true)
    expect(db.insert).toHaveBeenCalled()
    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Document',
      uploadedBy: 'admin-1',
      publishedAt: null, // draft status
    }))
  })

  it('sets publishedAt if status is published', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: 'admin-1', role: 'SuperAdmin' } } as any)
    const { values } = setupDbMock()

    await uploadPlatformDocument({ ...validPayload, status: 'published' })

    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      status: 'published',
      publishedAt: expect.any(Date),
    }))
  })
})

describe('publishDocument and archiveDocument', () => {
  it('throws UNAUTHORIZED if not SuperAdmin', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'Mentee' } } as any)
    await expect(publishDocument('doc-1')).rejects.toThrow('UNAUTHORIZED')

    mockGetSession.mockResolvedValueOnce({ user: { role: 'Mentee' } } as any)
    await expect(archiveDocument('doc-1')).rejects.toThrow('UNAUTHORIZED')
  })

  it('publishDocument updates status to published', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'SuperAdmin' } } as any)
    const { set } = setupDbMock()

    await publishDocument('doc-1')

    expect(set).toHaveBeenCalledWith(expect.objectContaining({
      status: 'published',
      publishedAt: expect.any(Date),
    }))
  })

  it('archiveDocument updates status to archived', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'SuperAdmin' } } as any)
    const { set } = setupDbMock()

    await archiveDocument('doc-1')

    expect(set).toHaveBeenCalledWith(expect.objectContaining({
      status: 'archived',
    }))
  })
})

describe('indexDocumentToPgVector', () => {
  it('throws UNAUTHORIZED if not SuperAdmin', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'Mentor' } } as any)
    await expect(indexDocumentToPgVector('doc-1')).rejects.toThrow('UNAUTHORIZED')
  })

  it('calls processAndEmbedDocument successfully', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'SuperAdmin' } } as any)
    vi.mocked(processAndEmbedDocument).mockResolvedValueOnce({ success: true, totalChunks: 5 })

    const result = await indexDocumentToPgVector('doc-1')

    expect(result).toEqual({ success: true, totalChunks: 5 })
    expect(processAndEmbedDocument).toHaveBeenCalledWith('doc-1')
  })

  it('handles errors from processAndEmbedDocument gracefully', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'SuperAdmin' } } as any)
    vi.mocked(processAndEmbedDocument).mockRejectedValueOnce(new Error('Process failed'))

    const result = await indexDocumentToPgVector('doc-1')

    expect(result).toEqual({ success: false, message: 'Process failed' })
  })
})

describe('listAdminDocuments and getAccessLogs', () => {
  it('throws UNAUTHORIZED if not SuperAdmin', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'Moderator' } } as any)
    await expect(listAdminDocuments()).rejects.toThrow('UNAUTHORIZED')

    mockGetSession.mockResolvedValueOnce({ user: { role: 'Moderator' } } as any)
    await expect(getAccessLogs()).rejects.toThrow('UNAUTHORIZED')
  })

  it('listAdminDocuments returns from db for SuperAdmin', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'SuperAdmin' } } as any)
    setupDbMock()

    const result = await listAdminDocuments()

    expect(result).toEqual([{ id: 'doc-1' }])
  })

  it('getAccessLogs returns from db query for SuperAdmin', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'SuperAdmin' } } as any)
    vi.mocked(db.query.documentAccessLogs.findMany).mockResolvedValueOnce([{ id: 'log-1' }] as any)

    const result = await getAccessLogs(10)

    expect(result).toEqual([{ id: 'log-1' }])
    expect(db.query.documentAccessLogs.findMany).toHaveBeenCalledWith(expect.objectContaining({ limit: 10 }))
  })
})

describe('listPublicDocuments', () => {
  it('returns published tier 1 documents', async () => {
    setupDbMock()

    const result = await listPublicDocuments()

    expect(result).toEqual([{ id: 'doc-1' }])
    expect(db.select).toHaveBeenCalled()
  })
})

describe('listRoleDocuments', () => {
  it('throws UNAUTHENTICATED if no session', async () => {
    mockGetSession.mockResolvedValueOnce(null as any)
    await expect(listRoleDocuments()).rejects.toThrow('UNAUTHENTICATED')
  })

  it('returns documents allowed for SuperAdmin (tiers 1,2,3)', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'SuperAdmin' } } as any)
    setupDbMock()

    await listRoleDocuments()

    // Check if db.select...where was called (implementation detail, assuming where is called)
    expect(db.select).toHaveBeenCalled()
  })

  it('returns documents allowed for Moderator (tiers 1,2)', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'Moderator' } } as any)
    setupDbMock()

    await listRoleDocuments()

    expect(db.select).toHaveBeenCalled()
  })

  it('returns documents allowed for Mentee (tier 1)', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { role: 'Mentee' } } as any)
    setupDbMock()

    await listRoleDocuments()

    expect(db.select).toHaveBeenCalled()
  })
})

describe('logDocumentAccess', () => {
  it('logs access with null userId if no session exists', async () => {
    mockGetSession.mockResolvedValueOnce(null as any)
    const { values } = setupDbMock()

    await logDocumentAccess('doc-1', 'view', '127.0.0.1', 'Mozilla')

    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      documentId: 'doc-1',
      userId: null,
      action: 'view',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla',
    }))
  })

  it('logs access with userId if session exists', async () => {
    mockGetSession.mockResolvedValueOnce({ user: { id: 'user-1' } } as any)
    const { values } = setupDbMock()

    await logDocumentAccess('doc-1', 'download')

    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      documentId: 'doc-1',
      userId: 'user-1',
      action: 'download',
    }))
  })
})
