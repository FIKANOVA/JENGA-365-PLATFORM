/**
 * Applies drizzle/0001_lovely_zarda.sql using the Neon HTTP driver
 * (same network path as the app, bypasses local IPv6 issues).
 *
 * Usage: npx tsx scripts/apply-migration-0001.ts
 */
import https from 'node:https';
import { readFileSync } from 'node:fs';

// ── Same fetch polyfill as src/lib/db/index.ts ──────────────────────────────
const originalFetch = global.fetch;
(global as any).fetch = async (url: string | Request | URL, options?: any) => {
    const urlStr = url.toString();
    if (urlStr.includes('neon.tech')) {
        const urlObj = new URL(urlStr);
        const host = urlObj.host;
        const ip = '54.86.249.90';
        return new Promise((resolve, reject) => {
            const body = options?.body;
            const reqOptions: https.RequestOptions = {
                hostname: ip, port: 443,
                path: urlObj.pathname + urlObj.search,
                method: options?.method || 'POST',
                headers: { ...(options?.headers || {}), 'Host': host, 'Content-Length': body ? Buffer.byteLength(body) : 0 },
                servername: host, rejectUnauthorized: false
            };
            const req = https.request(reqOptions, (res) => {
                let data = '';
                res.on('data', (c) => data += c);
                res.on('end', () => resolve({ status: res.statusCode, ok: res.statusCode! >= 200 && res.statusCode! < 300, text: async () => data, json: async () => JSON.parse(data), headers: new Headers(res.headers as any) } as any));
            });
            req.on('error', reject);
            if (body) req.write(body);
            req.end();
        });
    }
    return originalFetch(url, options);
};
// ─────────────────────────────────────────────────────────────────────────────

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
if (!DATABASE_URL) throw new Error('DATABASE_URL not set — run with dotenv: npx dotenv -e .env -- npx tsx scripts/apply-migration-0001.ts');

const sql = neon(DATABASE_URL);

async function run() {
    const migrationSql = readFileSync('drizzle/0001_lovely_zarda.sql', 'utf8');
    const statements = migrationSql
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(Boolean);

    console.log(`Applying ${statements.length} statements from 0001_lovely_zarda.sql…`);
    let applied = 0, skipped = 0;

    for (const stmt of statements) {
        try {
            await sql.query(stmt);
            applied++;
        } catch (e: any) {
            // PG error codes for "already exists": table=42P07, type=42710, schema=42P06, index=42P14
            if (['42P07', '42710', '42P06', '42P14'].includes(e.code)) {
                skipped++;
            } else {
                console.error(`  ✗ [${e.code}] ${String(e.message).substring(0, 120)}`);
            }
        }
    }
    console.log(`✓ Applied: ${applied} | Skipped (already existed): ${skipped}`);

    // Ensure tracking table exists
    await sql.query(`
        CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
            id SERIAL PRIMARY KEY,
            hash text NOT NULL,
            created_at bigint
        )
    `).catch(() => {});

    // Mark 0001 as applied
    const HASH_0001 = 'ace18a6eb2db8fa4b7abe7828477bf90b5698af6f16970bd701c051cf1039f36';
    await sql.query(
        `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ('${HASH_0001}', 1775964135793) ON CONFLICT DO NOTHING`
    );
    console.log('✓ Recorded 0001 in __drizzle_migrations');

    // Verify NGO tables exist
    const tables = ['ngo_mou_agreements', 'resource_exchange_log', 'give_back_tracking', 'power_hour_sessions', 'corporate_unlock_milestones'];
    console.log('\nTable verification:');
    for (const t of tables) {
        const rows = await sql.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='${t}') AS exists`);
        console.log(`  ${(rows[0] as any).exists ? '✓' : '✗'} ${t}`);
    }
}

run()
    .then(() => { console.log('\nMigration complete.'); process.exit(0); })
    .catch(e => { console.error('Fatal:', e.message); process.exit(1); });
