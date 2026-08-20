/**
 * Seed script for Sanity CMS.
 *
 * Populates or synchronizes all default placeholder documents in Sanity Studio.
 *
 * Usage:
 * npx dotenv -e .env -- npx tsx scripts/seed/seed-sanity.ts [--token=sk...]
 */

import { runSanitySeed } from "../../src/lib/sanity/seed-service";

// Check if a --token argument was provided
const tokenArg = process.argv.find((arg) => arg.startsWith("--token="));
const customToken = tokenArg ? tokenArg.split("=")[1] : undefined;

async function main() {
    console.log("🚀 Starting Sanity Starter Content Seeder...\n");

    try {
        const result = await runSanitySeed(customToken);
        console.log(`✅ ${result.message}\n`);
        console.log("📋 Seeded documents summary:");
        result.details.forEach((item) => console.log(`  ✓ ${item}`));
        console.log("\n🎉 All placeholder content is live in Sanity Studio!");
        console.log("👉 Open Sanity Studio at: /dashboard/admin/studio to edit text, swap background images, and update video links.");
    } catch (err: any) {
        console.error("\n❌ Sanity Seeding Error:", err.message || err);
        console.error("\n💡 How to fix:");
        console.error("1. Visit https://www.sanity.io/manage");
        console.error("2. Choose project 'juu4g4fy' -> API tab -> Tokens -> Add API Token");
        console.error("3. Set Permissions to 'Editor' or 'Admin' and copy the token (starts with 'sk...')");
        console.error("4. Run either:");
        console.error("   npx dotenv -e .env -- npx tsx scripts/seed/seed-sanity.ts --token=YOUR_SANITY_TOKEN");
        console.error("   OR add SANITY_WRITE_TOKEN=YOUR_SANITY_TOKEN to your .env file.");
        process.exit(1);
    }
}

main();
