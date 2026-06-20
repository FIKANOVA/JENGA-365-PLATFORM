import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProfile, requestDataExport } from '@/lib/actions/settings';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth/config';

vi.mock('@/lib/db/schema', () => ({
    users: { id: 'users_id' },
    mentorshipPairs: { mentorId: 'mentor_id', menteeId: 'mentee_id' },
    donations: { userId: 'user_id' },
    moodJournal: { menteeId: 'mentee_id' },
    userProfileAssets: { userId: 'user_id' },
    activityLog: { userId: 'user_id' },
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((c, v) => ({ eq: { c, v } })),
    or: vi.fn((...a) => ({ or: a })),
}));

vi.mock('@/lib/db', () => ({
    db: {
        update: vi.fn(),
        query: {
            users: {
                findFirst: vi.fn(),
            },
        },
        select: vi.fn(),
    },
}));

vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock('@/lib/auth/config', () => ({
    auth: {
        api: { getSession: vi.fn() },
    },
}));

describe('Settings Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updateProfile', () => {
        it('throws UNAUTHORIZED when session is null', async () => {
            vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any);
            await expect(updateProfile({ name: 'John' })).rejects.toThrow('UNAUTHORIZED');
        });

        it('returns success without db update if data is empty', async () => {
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
            const result = await updateProfile({});
            expect(result).toEqual({ success: true });
            expect(db.update).not.toHaveBeenCalled();
        });

        it('updates all provided fields correctly', async () => {
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
            const setMock = vi.fn().mockReturnValue({ where: vi.fn() });
            vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

            const result = await updateProfile({
                name: 'Alice',
                locationRegion: 'US',
                image: 'img.png'
            });

            expect(result).toEqual({ success: true });
            expect(db.update).toHaveBeenCalled();
            expect(setMock).toHaveBeenCalledWith({
                name: 'Alice',
                locationRegion: 'US',
                image: 'img.png'
            });
        });

        it('updates only the provided fields', async () => {
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);
            const setMock = vi.fn().mockReturnValue({ where: vi.fn() });
            vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

            const result = await updateProfile({ name: 'Alice' });

            expect(result).toEqual({ success: true });
            expect(db.update).toHaveBeenCalled();
            expect(setMock).toHaveBeenCalledWith({ name: 'Alice' });
        });
    });

    describe('requestDataExport', () => {
        it('throws UNAUTHORIZED when session is null', async () => {
            vi.mocked(auth.api.getSession).mockResolvedValueOnce(null as any);
            await expect(requestDataExport()).rejects.toThrow('UNAUTHORIZED');
        });

        it('fetches all data and strips sensitive fields', async () => {
            vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-1' } } as any);

            const mockUser = { id: 'user-1', name: 'Alice', embedding: [1, 2], embeddingStale: true };
            const mockPairs = [{ id: 'pair-1' }];
            const mockDonations = [{ id: 'don-1' }];
            const mockJournal = [{ id: 'jour-1' }];
            const mockAssets = [{ id: 'asset-1' }];
            const mockLogs = [{ id: 'log-1' }];

            vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(mockUser as any);

            let selectCallCount = 0;
            vi.mocked(db.select).mockImplementation(() => {
                selectCallCount++;
                return {
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockImplementation(() => {
                            if (selectCallCount === 5) {
                                return { limit: vi.fn().mockResolvedValueOnce(mockLogs) };
                            }
                            if (selectCallCount === 1) return Promise.resolve(mockPairs);
                            if (selectCallCount === 2) return Promise.resolve(mockDonations);
                            if (selectCallCount === 3) return Promise.resolve(mockJournal);
                            if (selectCallCount === 4) return Promise.resolve(mockAssets);
                        })
                    })
                } as any;
            });

            const result = await requestDataExport();

            // When undefined is assigned, Object.keys still returns the key.
            // We should just expect the value to be undefined
            expect(result.user).toEqual({ id: 'user-1', name: 'Alice', embedding: undefined, embeddingStale: undefined });
            expect(result.mentorshipPairs).toEqual(mockPairs);
            expect(result.donations).toEqual(mockDonations);
            expect(result.moodJournal).toEqual(mockJournal);
            expect(result.profileAssets).toEqual(mockAssets);
            expect(result.activityLog).toEqual(mockLogs);
            expect(result.exportedAt).toBeDefined();

            expect(result.user?.embedding).toBeUndefined();
            expect(result.user?.embeddingStale).toBeUndefined();
        });

        it('handles case when user is not found', async () => {
             vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: { id: 'user-2' } } as any);
             vi.mocked(db.query.users.findFirst).mockResolvedValueOnce(null as any);

             let selectCallCount = 0;
             vi.mocked(db.select).mockImplementation(() => {
                 selectCallCount++;
                 return {
                     from: vi.fn().mockReturnValue({
                         where: vi.fn().mockImplementation(() => {
                             if (selectCallCount === 5) {
                                 return { limit: vi.fn().mockResolvedValueOnce([]) };
                             }
                             return Promise.resolve([]);
                         })
                     })
                 } as any;
             });

             const result = await requestDataExport();
             expect(result.user).toBeNull();
        });
    });
});
