import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertMerchandiseStock } from '@/lib/actions/merchandise';
import { db } from '@/lib/db';
import { merchandise } from '@/lib/db/schema';
import { client as sanityClient } from '@/lib/sanity/client';
import { requireCapability } from '@/lib/auth/guard';

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            merchandise: {
                findFirst: vi.fn(),
            },
        },
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => Promise.resolve([])),
            })),
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => Promise.resolve([])),
            })),
        })),
        insert: vi.fn(() => ({
            values: vi.fn(() => Promise.resolve([])),
        })),
    },
}));

vi.mock('@/lib/db/schema', () => ({
    merchandise: {
        sanityProductId: 'sanityProductId',
    },
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    and: vi.fn(),
    gt: vi.fn(),
    sql: vi.fn(),
    inArray: vi.fn(),
}));

vi.mock('@/lib/auth/guard', () => ({
    requireCapability: vi.fn(),
}));

vi.mock('@/lib/sanity/client', () => ({
    client: {
        fetch: vi.fn(),
    },
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('Merchandise Sync Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should process 100 products', async () => {
        const mockProducts = Array.from({ length: 100 }).map((_, i) => ({
            _id: `prod_${i}`,
            title: `Product ${i}`,
            price: 10.99,
        }));

        vi.mocked(sanityClient.fetch).mockResolvedValue(mockProducts);

        // Mock findFirst to resolve immediately but keep track of calls
        let callCount = 0;
        vi.mocked(db.query.merchandise.findFirst).mockImplementation(async () => {
            callCount++;
            return null; // Always insert
        });

        const start = performance.now();
        await upsertMerchandiseStock();
        const end = performance.now();

        console.log(`Sync took ${end - start}ms`);

        // findFirst should not be called at all
        expect(db.query.merchandise.findFirst).not.toHaveBeenCalled();

        // select should be called once for the batch fetch
        expect(db.select).toHaveBeenCalledTimes(1);
    });
});
