/**
 * Directly updates SuperAdmin password hash using better-auth's own hashing function.
 * Run with: npx tsx src/scripts/reset-admin-password.ts
 */
import "dotenv/config";
import { webcrypto } from "node:crypto";
// @ts-ignore — polyfill for better-auth crypto module in Node 18
if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
if (!process.env.SUPERADMIN_EMAIL) throw new Error("SUPERADMIN_EMAIL not set");
if (!process.env.SUPERADMIN_PASSWORD) throw new Error("SUPERADMIN_PASSWORD not set");

const client = postgres(process.env.DATABASE_URL, { ssl: "require" });
const db = drizzle(client, { schema });

async function main() {
    const email = process.env.SUPERADMIN_EMAIL!;
    const newPassword = process.env.SUPERADMIN_PASSWORD!;

    // Import better-auth's hashPassword (same function used during sign-up)
    const { i: hashPassword } = await import(
        // @ts-ignore
        "../../node_modules/better-auth/dist/crypto-DgVHxgLL.mjs"
    );

    console.log(`Hashing password for ${email}...`);
    const hashed = await hashPassword(newPassword);

    const user = await db.query.users.findFirst({
        where: eq(schema.users.email, email),
    });

    if (!user) {
        console.error("❌ User not found. Run seed-superadmin-only.ts first.");
        await client.end();
        process.exit(1);
    }

    console.log(`Found user: ${user.id} (${user.role})`);

    // Update password in accounts table (providerId = "credential" for email/password)
    const result = await db.update(schema.accounts)
        .set({ password: hashed })
        .where(
            and(
                eq(schema.accounts.userId, user.id),
                eq(schema.accounts.providerId, "credential")
            )
        );

    // Also make sure user flags are correct
    await db.update(schema.users).set({
        role: "SuperAdmin" as any,
        emailVerified: true,
        isApproved: true,
        ndaSigned: true,
        status: "active",
    }).where(eq(schema.users.id, user.id));

    console.log(`\n✅ Password reset complete!\n   Email: ${email}\n   Password: ${newPassword}`);
    await client.end();
    process.exit(0);
}

main().catch(async (e) => {
    console.error("❌", e);
    await client.end();
    process.exit(1);
});
