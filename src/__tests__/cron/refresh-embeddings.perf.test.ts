import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/cron/refresh-embeddings/route';
import { db } from '@/lib/db';
import * as synthesizer from '@/lib/ai/profileSynthesizer';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(),
    }
}));

vi.mock('@/lib/ai/profileSynthesizer', () => ({
    synthesizeUserProfile: vi.fn(),
}));

describe('refresh-embeddings performance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should run efficiently', async () => {
        const mockStale = Array.from({ length: 25 }, (_, i) => ({ id: `user_${i}` }));

        (db.select().from().where().limit as any).mockResolvedValue(mockStale);

        // Mock synthesizeUserProfile to take 100ms
        const synthesizeSpy = vi.spyOn(synthesizer, 'synthesizeUserProfile').mockImplementation(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return { success: true, summary: "mock" };
        });

        const req = new NextRequest('http://localhost/api/cron/refresh-embeddings', {
            headers: {
                'authorization': `Bearer test-secret`
            }
        });

        const originalEnv = process.env.CRON_SECRET;
        process.env.CRON_SECRET = 'test-secret';

        const start = performance.now();
        const res = await GET(req);
        const end = performance.now();

        process.env.CRON_SECRET = originalEnv;

        const duration = end - start;
        console.log(`Execution time: ${duration}ms`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.refreshed).toBe(25);
        expect(synthesizeSpy).toHaveBeenCalledTimes(25);
    });
});
