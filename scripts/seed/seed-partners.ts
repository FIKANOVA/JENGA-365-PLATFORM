/**
 * Seed script for Corporate and NGO Partners.
 *
 * This script will create:
 * 1. A Corporate Partner record ("EcoCorp") and a linked CorporatePartner user.
 * 2. An NGO Partner record ("Green Earth Foundation"), a linked NGO user, and an MOU agreement.
 * 3. Seed some corporate unlock milestones and resources for the Corporate Partner.
 *
 * Usage:
 * npx dotenv -e .env -- npx tsx scripts/seed/seed-partners.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../src/lib/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    throw new Error("DATABASE_URL not set — run with: npx dotenv -e .env -- npx tsx scripts/seed/seed-partners.ts");
}

// ─── POLYFILL: Resilient Fetch for Neon ───
const originalFetch = global.fetch;
(global as any).fetch = async (url: string | Request | URL, options?: any) => {
    const urlStr = url.toString();
    if (urlStr.includes("neon.tech")) {
        const urlObj = new URL(urlStr);
        const host = urlObj.host;
        const ip = "54.86.249.90"; // Known working IP bridge
        const https = require("node:https");

        return new Promise((resolve, reject) => {
            const body = options?.body;
            const reqOptions = {
                hostname: ip,
                port: 443,
                path: urlObj.pathname + urlObj.search,
                method: options?.method || "POST",
                headers: {
                    ...(options?.headers || {}),
                    Host: host,
                    "Content-Length": body ? Buffer.byteLength(body) : 0,
                },
                servername: host, // SNI is crucial
                rejectUnauthorized: false,
            };

            const req = https.request(reqOptions, (res: any) => {
                let data = "";
                res.on("data", (chunk: string) => (data += chunk));
                res.on("end", () => {
                    resolve({
                        status: res.statusCode,
                        ok: res.statusCode! >= 200 && res.statusCode! < 300,
                        text: async () => data,
                        json: async () => JSON.parse(data),
                        headers: new Headers(res.headers as any),
                    } as any);
                });
            });

            req.on("error", (err: Error) => {
                console.error("[ResilientDB] Connection Error:", err.message);
                reject(err);
            });
            if (body) req.write(body);
            req.end();
        });
    }
    return originalFetch(url, options);
};
// ──────────────────────────────────────────

const db = drizzle(neon(DATABASE_URL), { schema });

async function run() {
    console.log("🌱 Seeding Partners...");

    // ==========================================
    // 1. Corporate Partner: EcoCorp
    // ==========================================
    const [corpPartner] = await db
        .insert(schema.corporatePartners)
        .values({
            orgName: "EcoCorp",
            contactEmail: "contact@ecocorp.example.com",
            sponsorshipTier: "Gold",
            employeeCount: 500,
        })
        .returning();

    console.log(`Created Corporate Partner record: EcoCorp (${corpPartner.id})`);

    const [corpUser] = await db
        .insert(schema.users)
        .values({
            email: "admin@ecocorp.example.com",
            name: "EcoCorp Admin",
            role: "CorporatePartner",
            partnerId: corpPartner.id,
            metadata: { orgType: "Corporate", sign_up_intent: "partner" },
        })
        .returning();

    console.log(`Created Corporate User: ${corpUser.email} (${corpUser.id})`);

    // Seed some Unlock Milestones for the Corporate Partner
    const [milestone1] = await db
        .insert(schema.corporateUnlockMilestones)
        .values({
            corporatePartnerId: corpUser.id,
            milestoneType: "tree_survival",
            thresholdValue: 1000,
            currentValue: 450,
            status: "LOCKED",
        })
        .returning();

    const [milestone2] = await db
        .insert(schema.corporateUnlockMilestones)
        .values({
            corporatePartnerId: corpUser.id,
            milestoneType: "mentorship_hours",
            thresholdValue: 50,
            currentValue: 50,
            status: "UNLOCKED",
            verifiedAt: new Date(),
        })
        .returning();

    // Resources tied to milestones
    await db.insert(schema.corporateResources).values({
        milestoneId: milestone1.id,
        resourceType: "funding",
        amount: 5000,
        currency: "USD",
        status: "LOCKED",
    });

    await db.insert(schema.corporateResources).values({
        milestoneId: milestone2.id,
        resourceType: "equipment",
        amount: 10, // e.g., 10 laptops
        currency: "USD",
        status: "UNLOCKED",
        unlockedAt: new Date(),
    });

    console.log("Seeded Corporate Milestones and Resources.");

    // ==========================================
    // 2. NGO Partner: Green Earth Foundation
    // ==========================================
    const [ngoPartner] = await db
        .insert(schema.corporatePartners)
        .values({
            orgName: "Green Earth Foundation",
            contactEmail: "hello@greenearth.example.com",
            sponsorshipTier: "NGO",
            employeeCount: 50,
        })
        .returning();

    console.log(`Created NGO Partner record: Green Earth Foundation (${ngoPartner.id})`);

    const [ngoUser] = await db
        .insert(schema.users)
        .values({
            email: "admin@greenearth.example.com",
            name: "Green Earth Admin",
            role: "NGO",
            partnerId: ngoPartner.id,
            metadata: { orgType: "NGO", sign_up_intent: "ngo" },
        })
        .returning();

    console.log(`Created NGO User: ${ngoUser.email} (${ngoUser.id})`);

    // Create an MOU so the NGO can bypass the MOU signing page on the dashboard
    await db.insert(schema.ngoMouAgreements).values({
        partnerId: ngoPartner.id,
        mouDocumentUrl: "https://example.com/mou.pdf",
        resourceTypes: ["funding", "equipment", "mentorship"],
        signedAt: new Date(),
        expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year from now
    });

    console.log("Seeded NGO MOU Agreement.");

    console.log("\n✅ Seeding Complete!\n");
    console.log("TEST CREDENTIALS (Authentication via magic link / passwordless in dev or manual password setting if implemented):");
    console.log("Corporate: admin@ecocorp.example.com");
    console.log("NGO:       admin@greenearth.example.com");
}

run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Fatal:", err);
        process.exit(1);
    });
