import { db } from "@/lib/db";
import { mentorshipPairs, sessionsLog } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getMenteeSessions } from "@/lib/db/queries/dashboard";

async function runBenchmark() {
    // Setup dummy data
    console.log("Measuring current implementation...");
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
        await getMenteeSessions("dummy-mentee-id");
    }
    const end = performance.now();
    console.log(`Time taken: ${end - start}ms`);
}

runBenchmark().catch(console.error);
