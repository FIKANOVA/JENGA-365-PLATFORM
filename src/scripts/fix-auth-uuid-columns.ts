/**
 * One-time migration: cast Better Auth user_id columns from text → uuid.
 *
 * Better Auth created session/account/two_factor with user_id as text.
 * Our Drizzle schema declares them as uuid. PostgreSQL needs an explicit
 * USING clause to perform the cast.
 *
 * Run ONCE before `npx drizzle-kit push`:
 *   npx tsx src/scripts/fix-auth-uuid-columns.ts
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" }); // fallback to .env

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connectionString) {
    console.error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set in .env.local");
    process.exit(1);
}

const sql = neon(connectionString);

async function run() {
    console.log("Checking Better Auth tables...");

    // Each statement uses USING because PostgreSQL cannot auto-cast text → uuid.
    // Safe: all existing user_id values are valid UUID strings inserted by Better Auth.
    const tables = ["session", "account", "two_factor"] as const;

    for (const table of tables) {
        // Check current column type before altering
        const rows = await sql`
            SELECT data_type
            FROM information_schema.columns
            WHERE table_name = ${table}
              AND column_name = 'user_id'
        `;

        if (rows.length === 0) {
            console.log(`  [skip] "${table}" table not found`);
            continue;
        }

        const currentType = rows[0].data_type;
        if (currentType === "uuid") {
            console.log(`  [ok]   "${table}".user_id is already uuid — skipping`);
            continue;
        }

        console.log(`  [fix]  "${table}".user_id is ${currentType} → casting to uuid`);
        await sql.query(`ALTER TABLE "${table}" ALTER COLUMN "user_id" TYPE uuid USING "user_id"::uuid`);
        console.log(`  [done] "${table}".user_id is now uuid`);
    }

    console.log("\nAll done. Now run: npx drizzle-kit push");
}

run().catch((err) => {
    console.error("Migration failed:", err.message ?? err);
    process.exit(1);
});
