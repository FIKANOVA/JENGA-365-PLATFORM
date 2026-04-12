import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL!;

async function migrate() {
    const sql = neon(url);
    console.log("Adding 'onboarded' column to 'users' table via Neon HTTP...");
    try {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE NOT NULL`;
        console.log("Successfully added 'onboarded' column.");

        const check = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarded'`;
        console.log("Verification - column exists:", check.length > 0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
