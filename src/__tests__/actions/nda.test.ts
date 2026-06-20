import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/schema', () => ({
  users: { id: 'id', status: 'status' },
  ndaSignatures: { id: 'id', userId: 'user_id' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_c, v) => ({ eq: v })),
}))

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    query: {
        users: { findFirst: vi.fn() }
    }
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

vi.mock('@/lib/auth/config', () => ({
  auth: {
    api: { getSession: vi.fn().mockResolvedValue({ user: { id: 'u-1' } }) },
  },
}))

vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn().mockResolvedValue(true),
}))

import { signNDA } from '@/lib/actions/nda'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications/service'

function setupDb() {
  const values = vi.fn().mockResolvedValue([{ id: 'nda-1' }])
  vi.mocked(db.insert).mockReturnValue({ values } as any)

  const set = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([{ id: 'u-1' }]) })
  vi.mocked(db.update).mockReturnValue({ set } as any)

  return { values, set }
}

describe('signNDA', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws Unauthorized when session is null', async () => {
    const { auth } = await import('@/lib/auth/config')
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any)

    const payload = {
        signatureName: "John Doe",
        ndaVersion: "1.0",
        role: "Mentee" as const,
        additionalDeclarations: [true, true],
        documentHash: "hash123",
    }
    await expect(signNDA(payload)).rejects.toThrow("Unauthorized")
  })

  it('throws validation error on invalid payload', async () => {
    const payload = {
        signatureName: "J", // too short
        ndaVersion: "", // empty
        role: "InvalidRole" as any,
        additionalDeclarations: [true, false], // not all true
        documentHash: "",
    }
    await expect(signNDA(payload)).rejects.toThrow()
  })

  it('successfully signs NDA for Mentee and returns correct redirect', async () => {
    const { values, set } = setupDb()

    const payload = {
        signatureName: "John Doe",
        ndaVersion: "1.0",
        role: "Mentee" as const,
        additionalDeclarations: [true],
        documentHash: "hash123",
    }

    const result = await signNDA(payload)

    expect(db.insert).toHaveBeenCalledOnce()
    expect(values.mock.calls[0][0].userId).toBe('u-1')
    expect(values.mock.calls[0][0].signatureName).toBe('John Doe')

    expect(db.update).toHaveBeenCalledOnce()
    expect(set.mock.calls[0][0].ndaSigned).toBe(true)
    expect(set.mock.calls[0][0].status).toBe('active')

    expect(createNotification).toHaveBeenCalledOnce()
    expect(result).toEqual({ success: true, redirectTo: '/check-email' })
  })

  it('successfully signs NDA for Mentor and returns correct redirect', async () => {
    const { set } = setupDb()

    const payload = {
        signatureName: "Jane Doe",
        ndaVersion: "1.0",
        role: "Mentor" as const,
        additionalDeclarations: [true],
        documentHash: "hash123",
    }

    const result = await signNDA(payload)

    expect(set.mock.calls[0][0].status).toBe('pending')
    expect(result).toEqual({ success: true, redirectTo: '/pending-approval?role=Mentor' })
  })

  it('successfully signs NDA for CorporatePartner and returns correct redirect', async () => {
    const { set } = setupDb()

    const payload = {
        signatureName: "Corp User",
        ndaVersion: "1.0",
        role: "CorporatePartner" as const,
        additionalDeclarations: [true],
        documentHash: "hash123",
    }

    const result = await signNDA(payload)

    expect(result).toEqual({ success: true, redirectTo: '/pending-approval?role=Corporate Partner' })
  })
})
