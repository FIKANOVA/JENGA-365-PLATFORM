/**
 * SuperAdmin Seed Script - Jenga365 AI Platform
 *
 * Run with: npx tsx src/scripts/seed-superadmin-only.ts
 *
 * Required env vars in .env.local:
 *   SUPERADMIN_EMAIL        — the admin email address
 *   SUPERADMIN_PASSWORD     — must match BOOTSTRAP_PASS in admin-setup/[token]/page.tsx
 *   SUPERADMIN_NAME         — display name (optional, defaults to "Super Admin")
 *   DATABASE_URL            — Neon production connection string
 *   BETTER_AUTH_URL         — production URL e.g. https://jenga365.vercel.app
 *
 * Creates:
 * - SuperAdmin user account
 * - Invite link token for one-time setup at /admin-setup/[token]
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { auth } from "@/lib/auth/config";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

if (!process.env.BETTER_AUTH_URL) {
    throw new Error("BETTER_AUTH_URL is not set");
}

const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
const db = drizzle(client, { schema });

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
if (!SUPERADMIN_EMAIL) throw new Error("SUPERADMIN_EMAIL is not set in .env");

async function main() {
    console.log("🌱 Creating SuperAdmin...\n");

    try {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(schema.users.email, SUPERADMIN_EMAIL)
        });

        let userId: string;
        let isNewUser = false;

        if (existingUser) {
            console.log(`ℹ️  User ${SUPERADMIN_EMAIL} already exists`);
            userId = existingUser.id;

            // Update role to SuperAdmin if not already
            if (existingUser.role !== "SuperAdmin") {
                await db.update(schema.users)
                    .set({ role: "SuperAdmin" as any })
                    .where(eq(schema.users.id, existingUser.id));
                console.log("✅ Updated user role to SuperAdmin");
            }
        } else {
            // Create user via better-auth using password from .env
            const adminPassword = process.env.SUPERADMIN_PASSWORD;
            if (!adminPassword) throw new Error("SUPERADMIN_PASSWORD is not set in .env");
            const adminName = process.env.SUPERADMIN_NAME ?? "Super Admin";

            try {
                await auth.api.signUpEmail({
                    body: {
                        email: SUPERADMIN_EMAIL,
                        password: adminPassword,
                        name: adminName,
                    },
                });

                // Get the created user
                const newUser = await db.query.users.findFirst({
                    where: eq(schema.users.email, SUPERADMIN_EMAIL)
                });

                if (!newUser) {
                    throw new Error("Failed to create user");
                }

                userId = newUser.id;
                isNewUser = true;

                // Update user to be fully set up
                await db.update(schema.users)
                    .set({
                        role: "SuperAdmin" as any,
                        emailVerified: true,
                        isApproved: true,
                        ndaSigned: true,
                        status: "active",
                    })
                    .where(eq(schema.users.id, userId));

                console.log("✅ Created SuperAdmin user");
            } catch (err: any) {
                if (err.message?.includes("already exists")) {
                    // User exists in auth but not in our users table
                    console.log("⚠️  User exists in auth system but not in database, checking...");
                    const authUser = await db.query.users.findFirst({
                        where: eq(schema.users.email, SUPERADMIN_EMAIL)
                    });
                    if (authUser) {
                        userId = authUser.id;
                    } else {
                        throw new Error("User exists in auth but cannot be found");
                    }
                } else {
                    throw err;
                }
            }
        }

        // Create invite link token
        const token = randomUUID();
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year expiry

        // Check if invite already exists
        const existingInvite = await db.query.inviteLinks.findFirst({
            where: eq(schema.inviteLinks.token, token)
        });

        if (!existingInvite) {
            await db.insert(schema.inviteLinks).values({
                inviterId: userId, // Self-invite for initial setup
                token: token,
                roleAssigned: "SuperAdmin",
                isUsed: false,
                expiresAt: expiresAt,
            });
            console.log("✅ Created invite link token");
        }

        // Generate the setup URL
        const setupUrl = `${process.env.BETTER_AUTH_URL}/admin-setup/${token}`;

        console.log("\n" + "=".repeat(60));
        console.log("🎉 SUPERADMIN SEED COMPLETE!");
        console.log("=".repeat(60));
        console.log(`\n📧 SuperAdmin Email: ${SUPERADMIN_EMAIL}`);
        console.log(`\n🔗 Password Setup Link:`);
        console.log(`   ${setupUrl}`);
        console.log("\n" + "=".repeat(60));
        console.log("\n📋 NEXT STEPS:");
        console.log("1. Open the link above in a browser");
        console.log("2. Set your password");
        console.log("3. Enable 2FA (recommended)");
        console.log("4. Sign the NDA");
        console.log("5. Access the Admin Dashboard");
        console.log("=".repeat(60));

        await client.end();
        process.exit(0);

    } catch (err: any) {
        console.error("❌ Seeding failed:", err);
        await client.end();
        process.exit(1);
    }
}

main();
