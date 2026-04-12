import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function migrate() {
    console.log("Adding 'onboarded' column to 'users' table...");
    try {
        await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE NOT NULL`);
        console.log("Successfully added 'onboarded' column.");
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
