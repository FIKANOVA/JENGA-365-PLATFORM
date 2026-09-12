import { bench, describe, vi } from 'vitest';
import { GET } from '@/app/api/cron/power-hour-check/route';
import { db } from '@/lib/db';

vi.mock('@/lib/db/schema', () => ({
  mentorCommitmentTracker: { id: 'id', mentorId: 'mentorId', month: 'month', hoursLogged: 'hoursLogged', status: 'status' },
  users: { id: 'id', role: 'role', status: 'status', isApproved: 'isApproved' },
}))

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((_col, val) => ({ eq: val })),
  and: vi.fn((...args) => args),
  inArray: vi.fn((_col, vals) => ({ inArray: vals })),
}))

vi.mock('@/lib/notifications/service', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/db', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn() },
}))

const mentors = Array.from({ length: 100 }).map((_, i) => ({ id: `m-${i}` }));

function setupMocks() {
  const mockWhere = vi.fn().mockResolvedValue([]);
  const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
  vi.mocked(db.update).mockReturnValue({ set: mockSet } as any);
  vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockResolvedValue([]) } as any);

  let selectCallCount = 0;
  vi.mocked(db.select).mockImplementation(() => {
    return {
      from: vi.fn().mockImplementation(() => {
        return {
          where: vi.fn().mockImplementation((cond: any) => {
            selectCallCount++;
            if (selectCallCount === 1) {
              return mentors;
            } else {
              return { limit: vi.fn().mockResolvedValue([{ id: 't-1', mentorId: 'test', hoursLogged: 60 }]) };
            }
          })
        };
      })
    } as any;
  });
}

describe('Power Hour cron performance', () => {
  bench('GET power-hour-check N+1', async () => {
    setupMocks();
    process.env.CRON_SECRET = 'test';
    const req = new Request('http://localhost/api/cron/power-hour-check', {
      headers: new Headers({ 'authorization': 'Bearer test' })
    });
    await GET(req);
  });
});
