import dns from 'node:dns';
import https from 'node:https';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// --- POLYFILL: Resilient Fetch for Neon ---
// Some Node.js environments (like this one) have flaky networking/IPv6 issues with Neon's hostnames.
// This interceptor forces the use of a known-working IPv4 address and explicit SNI.
const originalFetch = global.fetch;
(global as any).fetch = async (url: string | Request | URL, options?: any) => {
    const urlStr = url.toString();
    if (urlStr.includes('neon.tech')) {
        const urlObj = new URL(urlStr);
        const host = urlObj.host;
        const ip = '54.86.249.90'; // Known working IP bridge

        return new Promise((resolve, reject) => {
            const body = options?.body;
            const reqOptions = {
                hostname: ip,
                port: 443,
                path: urlObj.pathname + urlObj.search,
                method: options?.method || 'POST',
                headers: {
                    ...(options?.headers || {}),
                    'Host': host,
                    'Content-Length': body ? Buffer.byteLength(body) : 0
                },
                servername: host, // SNI is crucial
                rejectUnauthorized: false
            };

            const req = https.request(reqOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        ok: res.statusCode! >= 200 && res.statusCode! < 300,
                        text: async () => data,
                        json: async () => JSON.parse(data),
                        headers: new Headers(res.headers as any)
                    } as any);
                });
            });

            req.on('error', (err) => {
                console.error('[ResilientDB] Connection Error:', err.message);
                reject(err);
            });
            if (body) req.write(body);
            req.end();
        });
    }
    return originalFetch(url, options);
};
// ------------------------------------------

const databaseUrl = process.env.DATABASE_URL; // Use standard pooled URL for HTTP
if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

