import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mocks (factories must be self-contained — no outer variable references) ──
vi.mock('@/lib/db/schema', () => ({
  treeSurvivalChecks: { koboSubmissionId: 'kobo_submission_id' },
  treeSurvivalAudits: {},
  giveBackTracking: {},
  treePlantingEvents: {},
}))

vi.mock('@/lib/db', () => ({
  db: {
    insert: vi.fn(),
  },
}))

vi.mock('@/lib/actions/corporateUnlock', () => ({
  checkAndUnlockMilestones: vi.fn().mockResolvedValue(undefined),
}))

// ─── Imports (after mocks) ────────────────────────────────────────────────────
import { POST } from '@/app/api/webhooks/kobo/route'
import { db } from '@/lib/db'
import { checkAndUnlockMilestones } from '@/lib/actions/corporateUnlock'

// ─── Constants ────────────────────────────────────────────────────────────────
const KOBO_SECRET = 'test-kobo-secret-xyz'

const validTreeSurvivalPayload = {
  form_type: 'tree_survival',
  _id: 'kobo-sub-001',
  _submission_time: '2026-04-12T10:00:00Z',
  trees_planted: 200,
  trees_alive: 174,
  check_interval_months: 6,
  survey_date: '2026-04-10',
  surveyor_name: 'Jane Wanjiku',
  _geolocation: [-1.2921, 36.8219],
  _attachments: [{ download_url: 'https://kf.kobotoolbox.org/media/photo.jpg' }],
}

const validGiveBackPayload = {
  form_type: 'give_back',
  _id: 'kobo-sub-002',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  quarter: 'Q1-2026',
  activity_type: 'volunteering',
  activity_description: 'Planted trees at local park',
  _geolocation: [-1.2921, 36.8219],
  _attachments: [{ download_url: 'https://kf.kobotoolbox.org/media/photo.jpg' }],
}

const validTreePlantingPayload = {
  form_type: 'tree_planting',
  _id: 'kobo-sub-003',
  project_location_id: '123e4567-e89b-12d3-a456-426614174000',
  planted_at: '2026-04-15T10:00:00Z',
  trees_planted: 50,
  species: 'Acacia',
  planted_by: '123e4567-e89b-12d3-a456-426614174000',
  _geolocation: [-1.2921, 36.8219],
}

function makeRequest(token?: string, body: unknown = validTreeSurvivalPayload): Request {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (token !== undefined) headers.set('x-kobo-token', token)
  return new Request('http://localhost/api/webhooks/kobo', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

function setupInsertMock() {
  const mockReturning = vi.fn().mockResolvedValue([])
  const mockOnConflict = vi.fn().mockReturnValue({ returning: mockReturning })
  const mockValues = vi.fn().mockReturnValue({ onConflictDoNothing: mockOnConflict })
  vi.mocked(db.insert).mockReturnValue({ values: mockValues } as any)
  return { mockOnConflict, mockValues, mockReturning }
}

// ─── Auth guard ───────────────────────────────────────────────────────────────
describe('KoboToolbox webhook — auth guard', () => {
  beforeEach(() => {
    process.env.KOBO_WEBHOOK_SECRET = KOBO_SECRET
    vi.clearAllMocks()
    setupInsertMock()
  })
  afterEach(() => { delete process.env.KOBO_WEBHOOK_SECRET })

  it('returns 401 when x-kobo-token header is missing', async () => {
    const res = await POST(makeRequest(undefined))
    expect(res.status).toBe(401)
  })

  it('returns 401 when x-kobo-token is incorrect', async () => {
    const res = await POST(makeRequest('totally-wrong-token'))
    expect(res.status).toBe(401)
  })

  it('returns 200 { received: true } with a valid token and payload', async () => {
    const res = await POST(makeRequest(KOBO_SECRET))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ received: true })
  })

  it('does NOT call db.insert when auth fails', async () => {
    await POST(makeRequest('bad-token'))
    expect(db.insert).not.toHaveBeenCalled()
  })
})

// ─── Payload validation ───────────────────────────────────────────────────────
describe('KoboToolbox webhook — payload validation', () => {
  beforeEach(() => {
    process.env.KOBO_WEBHOOK_SECRET = KOBO_SECRET
    vi.clearAllMocks()
    setupInsertMock()
  })
  afterEach(() => { delete process.env.KOBO_WEBHOOK_SECRET })

  it('returns 422 when required fields are missing', async () => {
    const incomplete = { form_type: 'tree_survival', _id: 'x', _submission_time: '2026-01-01' }
    const res = await POST(makeRequest(KOBO_SECRET, incomplete))
    expect(res.status).toBe(422)
  })

  it('returns 422 when form_type is invalid or missing', async () => {
    const invalidFormType = { ...validTreeSurvivalPayload, form_type: 'invalid_type' }
    const res = await POST(makeRequest(KOBO_SECRET, invalidFormType))
    expect(res.status).toBe(422)
  })

  it('returns 400 on malformed JSON body', async () => {
    const headers = new Headers({
      'content-type': 'application/json',
      'x-kobo-token': KOBO_SECRET,
    })
    const req = new Request('http://localhost/api/webhooks/kobo', {
      method: 'POST',
      headers,
      body: 'not-json{{{',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

// ─── Idempotency ──────────────────────────────────────────────────────────────
describe('KoboToolbox webhook — idempotency and db ops', () => {
  beforeEach(() => {
    process.env.KOBO_WEBHOOK_SECRET = KOBO_SECRET
    vi.clearAllMocks()
  })
  afterEach(() => { delete process.env.KOBO_WEBHOOK_SECRET })

  it('calls onConflictDoNothing for tree_survival', async () => {
    const { mockOnConflict } = setupInsertMock()
    await POST(makeRequest(KOBO_SECRET, validTreeSurvivalPayload))
    // Note: tree_survival also does a second insert to treeSurvivalAudits if it succeeds,
    // so we expect at least one onConflictDoNothing call.
    expect(mockOnConflict).toHaveBeenCalled()
  })

  it('calls onConflictDoNothing for give_back', async () => {
    const { mockOnConflict } = setupInsertMock()
    await POST(makeRequest(KOBO_SECRET, validGiveBackPayload))
    expect(mockOnConflict).toHaveBeenCalledOnce()
  })

  it('calls onConflictDoNothing for tree_planting', async () => {
    const { mockOnConflict } = setupInsertMock()
    await POST(makeRequest(KOBO_SECRET, validTreePlantingPayload))
    expect(mockOnConflict).toHaveBeenCalledOnce()
  })

  it('returns 200 on a second identical submission (idempotent by design)', async () => {
    setupInsertMock()
    await POST(makeRequest(KOBO_SECRET, validTreeSurvivalPayload))
    setupInsertMock()
    const res = await POST(makeRequest(KOBO_SECRET, validTreeSurvivalPayload))
    expect(res.status).toBe(200)
  })
})

// ─── Single responsibility ────────────────────────────────────────────────────
describe('KoboToolbox webhook — single responsibility', () => {
  beforeEach(() => {
    process.env.KOBO_WEBHOOK_SECRET = KOBO_SECRET
    vi.clearAllMocks()
    setupInsertMock()
  })
  afterEach(() => { delete process.env.KOBO_WEBHOOK_SECRET })

  it('calls checkAndUnlockMilestones with tree_survival after insert', async () => {
    await POST(makeRequest(KOBO_SECRET, validTreeSurvivalPayload))
    // Give the void async call a tick to register
    await new Promise((r) => setTimeout(r, 0))
    expect(checkAndUnlockMilestones).toHaveBeenCalledWith('tree_survival')
  })

  it('does NOT call checkAndUnlockMilestones for tree_planting', async () => {
    await POST(makeRequest(KOBO_SECRET, validTreePlantingPayload))
    await new Promise((r) => setTimeout(r, 0))
    expect(checkAndUnlockMilestones).not.toHaveBeenCalled()
  })

  it('does NOT call checkAndUnlockMilestones for give_back', async () => {
    await POST(makeRequest(KOBO_SECRET, validGiveBackPayload))
    await new Promise((r) => setTimeout(r, 0))
    expect(checkAndUnlockMilestones).not.toHaveBeenCalled()
  })

  it('responds immediately without waiting for milestone check', async () => {
    let milestoneResolved = false
    vi.mocked(checkAndUnlockMilestones).mockImplementation(
      () =>
        new Promise((r) =>
          setTimeout(() => {
            milestoneResolved = true
            r(undefined)
          }, 500)
        )
    )
    const res = await POST(makeRequest(KOBO_SECRET, validTreeSurvivalPayload))
    // Response arrives before the 500ms delay resolves
    expect(res.status).toBe(200)
    expect(milestoneResolved).toBe(false)
  })
})
