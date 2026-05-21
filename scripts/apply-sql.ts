/**
 * Generic raw-SQL applier for Neon via the HTTP driver.
 *
 * Use this for migrations that contain PL/pgSQL functions, CREATE VIEW, GRANT,
 * or anything else Drizzle's schema-driven `drizzle-kit push` can't represent.
 *
 * Usage:
 *   npx dotenv -e .env -- npx tsx scripts/apply-sql.ts drizzle/0008_partner_dashboards.sql
 *
 * Statements in the file are sent individually using `--> statement-breakpoint`
 * markers as separators (Drizzle's convention). If no markers are present, the
 * entire file is sent as a single query — that works for most PL/pgSQL bodies
 * because the `$$ … $$` block is one statement to Postgres.
 */
import https from "node:https";
import { readFileSync } from "node:fs";

// Reuse the IPv6-workaround fetch polyfill from scripts/apply-migration-0001.ts.
const originalFetch = global.fetch;
(global as unknown as { fetch: typeof fetch }).fetch = async (url: string | Request | URL, options?: RequestInit) => {
    const urlStr = url.toString();
    if (urlStr.includes("neon.tech")) {
        const urlObj = new URL(urlStr);
        const host = urlObj.host;
        const ip = "54.86.249.90";
        return new Promise<Response>((resolve, reject) => {
            const body = options?.body as string | Buffer | undefined;
            const reqOptions: https.RequestOptions = {
                hostname: ip,
                port: 443,
                path: urlObj.pathname + urlObj.search,
                method: options?.method || "POST",
                headers: {
                    ...(options?.headers as Record<string, string> || {}),
                    Host: host,
                    "Content-Length": body ? Buffer.byteLength(body as string) : 0,
                },
                servername: host,
                rejectUnauthorized: false,
            };
            const req = https.request(reqOptions, (res) => {
                let data = "";
                res.on("data", (c) => (data += c));
                res.on("end", () =>
                    resolve({
                        status: res.statusCode,
                        ok: res.statusCode! >= 200 && res.statusCode! < 300,
                        text: async () => data,
                        json: async () => JSON.parse(data),
                        headers: new Headers(res.headers as Record<string, string>),
                    } as unknown as Response),
                );
            });
            req.on("error", reject);
            if (body) req.write(body);
            req.end();
        });
    }
    return originalFetch(url, options);
};

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error("DATABASE_URL not set — run with dotenv: npx dotenv -e .env -- npx tsx scripts/apply-sql.ts <file>");
}

const file = process.argv[2];
if (!file) {
    throw new Error("Usage: npx tsx scripts/apply-sql.ts <path/to/file.sql>");
}

const sql = neon(DATABASE_URL);

async function run() {
    const raw = readFileSync(file, "utf8");
    const statements = raw.includes("--> statement-breakpoint")
        ? raw.split("--> statement-breakpoint").map((s) => s.trim()).filter(Boolean)
        : [raw];

    console.log(`Applying ${statements.length} statement(s) from ${file}…`);
    let ok = 0;
    let skipped = 0;
    const benign = ["42P07", "42710", "42P06", "42P14", "42701"]; // "already exists" codes
    for (const stmt of statements) {
        try {
            await sql.query(stmt);
            ok++;
        } catch (e) {
            const code = (e as { code?: string }).code;
            if (code && benign.includes(code)) {
                skipped++;
            } else {
                console.error(`  ✗ [${code ?? "?"}] ${String((e as Error).message).substring(0, 200)}`);
                throw e;
            }
        }
    }
    console.log(`✓ Applied: ${ok} | Skipped (already existed): ${skipped}`);
}

run()
    .then(() => {
        console.log("Done.");
        process.exit(0);
    })
    .catch((e: Error) => {
        console.error("Fatal:", e.message);
        process.exit(1);
    });
