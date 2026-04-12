import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL!;

async function run() {
    console.log("Connecting to Neon...");
    const sql = neon(url);

    try {
        console.log("Step 1: Connection Check");
        const res = await sql`SELECT 1 as connected`;
        console.log("Connected:", res);

        console.log("Step 2: Schema Migration");
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE NOT NULL`;
        console.log("Migration successful!");

        console.log("Step 3: Verification");
        const check = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarded'`;
        console.log("Verify column exists:", check.length > 0);

    } catch (err) {
        console.error("Operation failed:", err);
    }
}

run();
