import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetSession } = vi.hoisted(() => ({
    mockGetSession: vi.fn(),
}));

vi.mock('@/lib/auth/config', () => ({
    auth: {
        api: {
            getSession: mockGetSession,
        },
    },
}));

vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { requireCapability } from '@/lib/auth/guard';

describe('requireCapability', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('throws UNAUTHORIZED when session is missing', async () => {
        mockGetSession.mockResolvedValueOnce(null);
        await expect(requireCapability('UPSERT_MERCHANDISE_STOCK')).rejects.toThrow('UNAUTHORIZED');
    });

    it('allows SuperAdmin regardless of casing and scopes', async () => {
        mockGetSession.mockResolvedValueOnce({
            user: { id: 'u1', role: 'superadmin' },
        });
        await expect(requireCapability('UPSERT_MERCHANDISE_STOCK')).resolves.toBeUndefined();

        mockGetSession.mockResolvedValueOnce({
            user: { id: 'u2', role: 'SuperAdmin' },
        });
        await expect(requireCapability('UPSERT_MERCHANDISE_STOCK')).resolves.toBeUndefined();
    });

    it('allows Moderator with content scope (JSON array and plain string)', async () => {
        mockGetSession.mockResolvedValueOnce({
            user: { id: 'm1', role: 'Moderator', moderationScope: '["content"]' },
        });
        await expect(requireCapability('UPSERT_MERCHANDISE_STOCK')).resolves.toBeUndefined();

        mockGetSession.mockResolvedValueOnce({
            user: { id: 'm2', role: 'moderator', moderationScope: 'content' },
        });
        await expect(requireCapability('UPSERT_MERCHANDISE_STOCK')).resolves.toBeUndefined();
    });

    it('throws FORBIDDEN when Moderator lacks required scope', async () => {
        mockGetSession.mockResolvedValueOnce({
            user: { id: 'm3', role: 'Moderator', moderationScope: '["mentor_applications"]' },
        });
        await expect(requireCapability('UPSERT_MERCHANDISE_STOCK')).rejects.toThrow('FORBIDDEN:UPSERT_MERCHANDISE_STOCK');
    });

    it('throws FORBIDDEN for standard roles like Mentee or Mentor', async () => {
        mockGetSession.mockResolvedValueOnce({
            user: { id: 'm4', role: 'Mentor' },
        });
        await expect(requireCapability('UPSERT_MERCHANDISE_STOCK')).rejects.toThrow('FORBIDDEN:UPSERT_MERCHANDISE_STOCK');
    });
});
