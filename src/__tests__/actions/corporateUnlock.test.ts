import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@/lib/db/schema', () => ({
  treeSurvivalChecks: {
    projectLocationId: 'project_location_id',
    treesAlive: 'trees_alive',
    surveyDate: 'survey_date',
  },
  corporateUnlockMilestones: {
    id: 'id',
    status: 'status',
    milestoneType: 'milestone_type',
    currentValue: 'current_value',
    verifiedAt: 'verified_at',
    thresholdValue: 'threshold_value',
  },
  corporateResources: {
    milestoneId: 'milestone_id',
    status: 'status',
    unlockedAt: 'unlocked_at',
  },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col, val) => ({ eq: val })),
  and: vi.fn((...args) => args),
  desc: vi.fn((col) => col),
  sql: vi.fn(() => 'mocked_sql'),
}))

vi.mock('@/lib/db', () => ({
  db: {
    selectDistinctOn: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
  },
}))

import { checkAndUnlockMilestones } from '@/lib/actions/corporateUnlock'
import { db } from '@/lib/db'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeMilestone(overrides: Record<string, unknown> = {}) {
  return {
    id: 'milestone-1',
    corporatePartnerId: 'partner-1',
    milestoneType: 'tree_survival',
    thresholdValue: 500,
    currentValue: 0,
    status: 'LOCKED',
    ...overrides,
  }
}

/**
 * Wire up the DB mock chain for a given test scenario.
 *
 * selectDistinctOn(...).from(...).orderBy(...).as(...) → subquery object
 * select(...).from(subquery) → [{ totalAlive }]
 * select(...).from(milestones).where(...) → locked milestone rows
 * update(...).set(...).where(...) → []
 */
function setupDbMocks({
  totalAlive,
  milestones,
}: {
  totalAlive: number
  milestones: ReturnType<typeof makeMilestone>[]
}) {
  const mockWhere = vi.fn().mockResolvedValue([])
  const mockSet = vi.fn().mockReturnValue({ where: mockWhere })
  vi.mocked(db.update).mockReturnValue({ set: mockSet } as any)

  // selectDistinctOn chain → returns a named subquery
  const distinctAs = vi.fn().mockReturnValue({ treesAlive: 'trees_alive_col' })
  const distinctOrderBy = vi.fn().mockReturnValue({ as: distinctAs })
  const distinctFrom = vi.fn().mockReturnValue({ orderBy: distinctOrderBy })
  vi.mocked(db.selectDistinctOn).mockReturnValue({ from: distinctFrom } as any)

  // select() is called twice:
  //   call 1 — SUM from the distinct subquery → { totalAlive }
  //   call 2 — locked milestones list
  let selectCallCount = 0
  vi.mocked(db.select).mockImplementation(() => {
    selectCallCount++
    if (selectCallCount === 1) {
      // SUM query: .from(subquery) resolves to [{ totalAlive }]
      return { from: vi.fn().mockResolvedValue([{ totalAlive }]) } as any
    }
    // Milestones query: .from(...).where(...) resolves to milestone rows
    return {
      from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(milestones) }),
    } as any
  })

  return { mockSet, mockWhere }
}

// ─── Anti-double-counting ─────────────────────────────────────────────────────
describe('checkAndUnlockMilestones — tree_survival counting (DISTINCT ON)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('uses selectDistinctOn to get the most recent trees_alive per location', async () => {
    setupDbMocks({ totalAlive: 0, milestones: [makeMilestone()] })
    await checkAndUnlockMilestones('tree_survival')
    expect(db.selectDistinctOn).toHaveBeenCalledOnce()
  })

  it('computes the survival count only once even when multiple milestones exist', async () => {
    setupDbMocks({
      totalAlive: 300,
      milestones: [makeMilestone(), makeMilestone({ id: 'milestone-2' })],
    })
    await checkAndUnlockMilestones('tree_survival')
    // selectDistinctOn called once — count is shared across all milestone evaluations
    expect(db.selectDistinctOn).toHaveBeenCalledOnce()
  })
})

// ─── Milestone stays LOCKED ───────────────────────────────────────────────────
describe('checkAndUnlockMilestones — milestone stays LOCKED', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('does NOT set status=UNLOCKED when totalAlive < thresholdValue', async () => {
    const { mockSet } = setupDbMocks({
      totalAlive: 299,
      milestones: [makeMilestone({ thresholdValue: 300 })],
    })
    await checkAndUnlockMilestones('tree_survival')
    const unlockedCall = mockSet.mock.calls.find((args) => args[0]?.status === 'UNLOCKED')
    expect(unlockedCall).toBeUndefined()
  })

  it('records currentValue progress even when milestone stays LOCKED', async () => {
    const { mockSet } = setupDbMocks({
      totalAlive: 250,
      milestones: [makeMilestone({ thresholdValue: 500 })],
    })
    await checkAndUnlockMilestones('tree_survival')
    const progressCall = mockSet.mock.calls.find((args) => args[0]?.currentValue === 250)
    expect(progressCall).toBeDefined()
  })
})

// ─── Milestone transitions to UNLOCKED ───────────────────────────────────────
describe('checkAndUnlockMilestones — milestone transitions to UNLOCKED', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('sets milestone status=UNLOCKED when totalAlive >= thresholdValue', async () => {
    const { mockSet } = setupDbMocks({
      totalAlive: 500,
      milestones: [makeMilestone({ thresholdValue: 500 })],
    })
    await checkAndUnlockMilestones('tree_survival')
    const unlockedCall = mockSet.mock.calls.find((args) => args[0]?.status === 'UNLOCKED')
    expect(unlockedCall).toBeDefined()
    expect(unlockedCall![0].verifiedAt).toBeInstanceOf(Date)
  })

  it('unlocks at exact boundary (totalAlive === thresholdValue)', async () => {
    const { mockSet } = setupDbMocks({
      totalAlive: 300,
      milestones: [makeMilestone({ thresholdValue: 300 })],
    })
    await checkAndUnlockMilestones('tree_survival')
    expect(mockSet.mock.calls.find((args) => args[0]?.status === 'UNLOCKED')).toBeDefined()
  })

  it('also releases corporate_resources when milestone unlocks', async () => {
    setupDbMocks({
      totalAlive: 1000,
      milestones: [makeMilestone({ thresholdValue: 500 })],
    })
    await checkAndUnlockMilestones('tree_survival')
    // db.update called twice — once for milestone, once for resources
    expect(db.update).toHaveBeenCalledTimes(2)
  })
})

// ─── No milestones ────────────────────────────────────────────────────────────
describe('checkAndUnlockMilestones — no-op when no LOCKED milestones', () => {
  it('does not call db.update when milestone list is empty', async () => {
    vi.clearAllMocks()
    setupDbMocks({ totalAlive: 999, milestones: [] })
    await checkAndUnlockMilestones('tree_survival')
    expect(db.update).not.toHaveBeenCalled()
  })
})
