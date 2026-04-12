import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  ngoMouAgreements: { id: 'id', partnerId: 'partner_id' },
  resourceExchangeLog: { id: 'id', fromPartnerId: 'from_partner_id' },
  users: { id: 'id', metadata: 'metadata' },
  sessions: {},
  accounts: {},
  verifications: {},
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col, val) => ({ eq: val })),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

import { createMouAgreement, logResourceExchange } from '@/lib/actions/ngoWorkflow'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth/config'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function setupSessionMock(userId: string) {
  vi.mocked(auth.api.getSession).mockResolvedValue({
    user: { id: userId, name: 'Test User', email: 'test@example.com' },
    session: {} as any,
  } as any)
}

function setupNoSession() {
  vi.mocked(auth.api.getSession).mockResolvedValue(null)
}

function setupUserMock(orgType: string | undefined) {
  vi.mocked(db.select).mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          then: vi.fn((cb: any) => Promise.resolve(cb([{ metadata: orgType ? { orgType } : {} }]))),
        }),
      }),
    }),
  } as any)
}

function setupInsertMock(returnId: string) {
  vi.mocked(db.insert).mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: returnId }]),
    }),
  } as any)
}

// ─── createMouAgreement ───────────────────────────────────────────────────────
describe('createMouAgreement — NGO guard', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('throws UNAUTHORIZED when no session', async () => {
    setupNoSession()
    await expect(
      createMouAgreement({ partnerCorporateId: 'cp-1' })
    ).rejects.toThrow('UNAUTHORIZED')
  })

  it('throws NGO_ONLY when user metadata.orgType is not NGO', async () => {
    setupSessionMock('u-1')
    setupUserMock('Corporate')
    await expect(
      createMouAgreement({ partnerCorporateId: 'cp-1' })
    ).rejects.toThrow('NGO_ONLY')
  })

  it('throws NGO_ONLY when user has no metadata', async () => {
    setupSessionMock('u-1')
    setupUserMock(undefined)
    await expect(
      createMouAgreement({ partnerCorporateId: 'cp-1' })
    ).rejects.toThrow('NGO_ONLY')
  })

  it('inserts into ngoMouAgreements and returns id when orgType is NGO', async () => {
    setupSessionMock('u-ngo')
    setupUserMock('NGO')
    setupInsertMock('mou-uuid-123')
    const id = await createMouAgreement({
      partnerCorporateId: 'cp-1',
      mouDocumentUrl: 'https://example.com/mou.pdf',
      resourceTypes: ['funding', 'equipment'],
    })
    expect(id).toBe('mou-uuid-123')
    expect(db.insert).toHaveBeenCalledOnce()
  })
})

// ─── logResourceExchange ──────────────────────────────────────────────────────
describe('logResourceExchange — NGO guard', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('throws UNAUTHORIZED when no session', async () => {
    setupNoSession()
    await expect(
      logResourceExchange({ fromPartnerId: 'p-1', toPartnerId: 'p-2', resourceType: 'books' })
    ).rejects.toThrow('UNAUTHORIZED')
  })

  it('throws NGO_ONLY when fromUser is not an NGO', async () => {
    setupSessionMock('u-1')
    setupUserMock('Corporate')
    await expect(
      logResourceExchange({ fromPartnerId: 'p-1', toPartnerId: 'p-2', resourceType: 'books' })
    ).rejects.toThrow('NGO_ONLY')
  })

  it('inserts into resourceExchangeLog with no payment reference when NGO', async () => {
    setupSessionMock('u-ngo')
    setupUserMock('NGO')
    setupInsertMock('exchange-uuid-456')
    const id = await logResourceExchange({
      fromPartnerId: 'p-1',
      toPartnerId: 'p-2',
      resourceType: 'books',
      quantity: 50,
    })
    expect(id).toBe('exchange-uuid-456')
    // Verify the inserted values contain no paystackReference or payment fields
    const insertCall = vi.mocked(db.insert).mock.results[0].value
    const valuesCall = insertCall.values.mock.calls[0][0]
    expect(valuesCall).not.toHaveProperty('paystackReference')
    expect(valuesCall).not.toHaveProperty('paymentReference')
  })
})

// ─── Shared guard ─────────────────────────────────────────────────────────────
describe('assertNgoPartner is called by both functions', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('createMouAgreement calls db.select to look up user (guard invoked)', async () => {
    setupSessionMock('u-ngo')
    setupUserMock('NGO')
    setupInsertMock('x')
    await createMouAgreement({ partnerCorporateId: 'cp-1' })
    expect(db.select).toHaveBeenCalledOnce()
  })

  it('logResourceExchange calls db.select to look up user (guard invoked)', async () => {
    setupSessionMock('u-ngo')
    setupUserMock('NGO')
    setupInsertMock('x')
    await logResourceExchange({ fromPartnerId: 'p-1', toPartnerId: 'p-2', resourceType: 'food' })
    expect(db.select).toHaveBeenCalledOnce()
  })
})
