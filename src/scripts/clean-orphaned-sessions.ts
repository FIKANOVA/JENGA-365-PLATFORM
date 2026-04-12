/**
 * One-time cleanup: remove orphaned rows from session and account tables.
 *
 * After casting user_id to uuid, drizzle-kit push fails when adding the FK
 * constraint because some session/account rows reference user_ids that no
 * longer exist in the users table.
 *
 * Run ONCE before `npx drizzle-kit push`:
 *   npx tsx src/scripts/clean-orphaned-sessions.ts
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connectionString) {
    console.error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set");
    process.exit(1);
}

const sql = neon(connectionString);

async function run() {
    console.log("Cleaning orphaned rows...");

    const sessionResult = await sql`
        DELETE FROM "session" WHERE "user_id" NOT IN (SELECT id FROM "users") RETURNING "id"
    `;
    console.log(`  [done] Deleted ${sessionResult.length} orphaned session row(s)`);

    const accountResult = await sql`
        DELETE FROM "account" WHERE "user_id" NOT IN (SELECT id FROM "users") RETURNING "id"
    `;
    console.log(`  [done] Deleted ${accountResult.length} orphaned account row(s)`);

    console.log("\nAll done. Now run: npx drizzle-kit push");
}

run().catch((err) => {
    console.error("Cleanup failed:", err.message ?? err);
    process.exit(1);
});
