import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL;
let dbClient: ReturnType<typeof drizzle<typeof schema>>;

if (!connectionString || connectionString.includes('dummy') || connectionString.includes('localhost')) {
    // Mock DB for build step and unit tests
    const mockTx = {
        update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
        insert: () => ({ values: () => ({ returning: () => [], onConflictDoNothing: () => ({ returning: () => [] }) }) }),
        delete: () => ({ where: () => ({ returning: () => [] }) }),
        select: () => ({ from: () => ({ where: () => ({ limit: () => [], groupBy: () => ({ as: () => [] }) }) }) }),
    };

    // Create an iterable builder
    const mockIterable = Object.assign([], {
        from: function() { return this; },
        leftJoin: function() { return this; },
        innerJoin: function() { return this; },
        where: function() { return this; },
        groupBy: function() { return this; },
        orderBy: function() { return this; },
        limit: function() { return this; },
        as: function() { return this; }
    });

    dbClient = {
        select: () => mockIterable,
        query: {
            users: { findFirst: async () => null, findMany: async () => [] },
            articles: { findFirst: async () => null, findMany: async () => [] },
            mentorshipPairs: { findFirst: async () => null, findMany: async () => [] },
            inviteLinks: { findFirst: async () => null, findMany: async () => [] },
            merchandise: { findFirst: async () => null, findMany: async () => [] },
            projectLocations: { findFirst: async () => null, findMany: async () => [] },
            learningPathways: { findFirst: async () => null, findMany: async () => [] },
            ndaSignatures: { findFirst: async () => null, findMany: async () => [] },
            corporateUnlockMilestones: { findFirst: async () => null, findMany: async () => [] },
            donations: { findFirst: async () => null, findMany: async () => [] },
            orders: { findFirst: async () => null, findMany: async () => [] },
        },
        insert: mockTx.insert,
        update: mockTx.update,
        delete: mockTx.delete,
        transaction: async (cb: any) => cb(mockTx),
    } as any;
} else {
    const client = neon(connectionString);
    dbClient = drizzle(client, { schema });
}

export const db = dbClient;
