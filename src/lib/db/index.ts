import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Ensure IPv4 is prioritized on server Node environments to prevent Neon fetch timeouts
if (typeof window === 'undefined' && typeof process !== 'undefined') {
    import('node:dns').then((dns) => {
        if (typeof dns?.setDefaultResultOrder === 'function') {
            try {
                dns.setDefaultResultOrder('ipv4first');
            } catch {
                // Ignore if environment restricts DNS customization
            }
        }
    }).catch(() => {});
}

// Resilient fetch wrapper with fallback for local Node / undici network timeouts
if (typeof window === 'undefined' && typeof globalThis.fetch === 'function') {
    neonConfig.fetchFunction = async (url: string | URL | Request, options?: any) => {
        try {
            return await globalThis.fetch(url, options);
        } catch (fetchErr) {
            const urlStr = url.toString();
            if (urlStr.includes('neon.tech')) {
                const urlObj = new URL(urlStr);
                const https = await import('node:https');
                return new Promise((resolve, reject) => {
                    const body = options?.body;
                    const reqOptions = {
                        hostname: urlObj.hostname,
                        port: urlObj.port || 443,
                        path: urlObj.pathname + urlObj.search,
                        method: options?.method || 'POST',
                        headers: {
                            ...(options?.headers || {}),
                            Host: urlObj.hostname,
                            'Content-Length': body ? Buffer.byteLength(body) : 0,
                        },
                        servername: urlObj.hostname,
                    };

                    const req = https.request(reqOptions, (res) => {
                        let data = '';
                        res.on('data', (chunk: string) => (data += chunk));
                        res.on('end', () => {
                            resolve({
                                status: res.statusCode ?? 200,
                                ok: (res.statusCode ?? 200) >= 200 && (res.statusCode ?? 200) < 300,
                                text: async () => data,
                                json: async () => JSON.parse(data),
                                headers: new Headers(res.headers as any),
                            } as any);
                        });
                    });

                    req.on('error', (err) => reject(err));
                    if (body) req.write(body);
                    req.end();
                });
            }
            throw fetchErr;
        }
    };
}

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
