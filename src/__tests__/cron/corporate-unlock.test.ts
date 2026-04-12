import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/actions/corporateUnlock', () => ({
  checkAndUnlockMilestones: vi.fn().mockResolvedValue(undefined),
}))

import { GET } from '@/app/api/cron/corporate-unlock/route'
import { checkAndUnlockMilestones } from '@/lib/actions/corporateUnlock'

const CRON_SECRET = 'test-cron-secret-unlock'

function makeRequest(authHeader?: string): Request {
  const headers = new Headers()
  if (authHeader !== undefined) headers.set('authorization', authHeader)
  return new Request('http://localhost/api/cron/corporate-unlock', { headers })
}

describe('Corporate Unlock cron — auth guard', () => {
  beforeEach(() => { process.env.CRON_SECRET = CRON_SECRET; vi.clearAllMocks() })
  afterEach(() => { delete process.env.CRON_SECRET })

  it('returns 401 when Authorization header is missing', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 401 when Authorization header has wrong secret', async () => {
    const res = await GET(makeRequest('Bearer wrong'))
    expect(res.status).toBe(401)
  })

  it('returns 200 { success: true } with correct secret', async () => {
    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
  })
})

describe('Corporate Unlock cron — behaviour', () => {
  beforeEach(() => { process.env.CRON_SECRET = CRON_SECRET; vi.clearAllMocks() })
  afterEach(() => { delete process.env.CRON_SECRET })

  it('calls checkAndUnlockMilestones with no arguments — checks all milestone types', async () => {
    await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(checkAndUnlockMilestones).toHaveBeenCalledOnce()
    expect(checkAndUnlockMilestones).toHaveBeenCalledWith()
  })

  it('returns 500 when checkAndUnlockMilestones throws', async () => {
    vi.mocked(checkAndUnlockMilestones).mockRejectedValueOnce(new Error('DB connection lost'))
    const res = await GET(makeRequest(`Bearer ${CRON_SECRET}`))
    expect(res.status).toBe(500)
    expect((await res.json()).success).toBe(false)
  })
})
