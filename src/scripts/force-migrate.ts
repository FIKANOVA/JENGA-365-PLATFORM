import postgres from "postgres";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!url) {
    console.error("No database URL found");
    process.exit(1);
}

async function run() {
    console.log("Connecting to unpooled database...");
    const sql = postgres(url!, {
        ssl: 'require',
        max: 1,
        connect_timeout: 10,
        idle_timeout: 10,
    });

    try {
        console.log("Attempting to add 'onboarded' column...");
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE NOT NULL`;
        console.log("Success!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await sql.end();
    }
}

run();
