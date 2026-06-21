import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../src/lib/db/schema";
import { createClient } from "@sanity/client";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
}

const db = drizzle(neon(DATABASE_URL), { schema });

const sanityWriteClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-03-04",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

async function run() {
    console.log("🧹 Clearing existing articles...");
    
    // Get all articles from Neon
    const existingArticles = await db.select().from(schema.articles);
    console.log(`Found ${existingArticles.length} articles in Neon.`);

    // Delete from Sanity
    for (const article of existingArticles) {
        const sanityId = `article-jenga-${article.id}`;
        try {
            await sanityWriteClient.delete(sanityId);
            console.log(`✓ Deleted from Sanity: ${sanityId}`);
        } catch (err: any) {
            if (!String(err?.message ?? "").toLowerCase().includes("not found")) {
                console.error(`❌ Error deleting from Sanity: ${sanityId}`, err);
            }
        }
    }

    // Delete from Neon
    await db.delete(schema.articles);
    console.log("✓ Cleared all articles from Neon");

    console.log("🧹 Done clearing articles.");
}

run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Fatal:", err);
        process.exit(1);
    });
