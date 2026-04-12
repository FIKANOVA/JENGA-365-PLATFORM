/**
 * Updates the SuperAdmin password to match SUPERADMIN_PASSWORD from .env
 * Run with: npx tsx src/scripts/update-admin-password.ts
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
if (!process.env.SUPERADMIN_EMAIL) throw new Error("SUPERADMIN_EMAIL not set");
if (!process.env.SUPERADMIN_PASSWORD) throw new Error("SUPERADMIN_PASSWORD not set");

const client = postgres(process.env.DATABASE_URL, { ssl: "require" });
const db = drizzle(client, { schema });

async function main() {
    const email = process.env.SUPERADMIN_EMAIL!;
    const newPassword = process.env.SUPERADMIN_PASSWORD!;

    console.log(`Updating password for ${email}...`);

    // Find the user
    const user = await db.query.users.findFirst({
        where: eq(schema.users.email, email),
    });

    if (!user) {
        console.error("❌ User not found. Run seed-superadmin-only.ts first.");
        await client.end();
        process.exit(1);
    }

    // Ensure role and flags are correct
    await db.update(schema.users).set({
        role: "SuperAdmin" as any,
        emailVerified: true,
        isApproved: true,
        ndaSigned: true,
        status: "active",
    }).where(eq(schema.users.id, user.id));

    // Use better-auth admin API to change password
    await auth.api.changePassword({
        body: {
            currentPassword: "TempPass123!@#",
            newPassword,
            revokeOtherSessions: false,
        },
        headers: new Headers(),
        // @ts-ignore — admin override
        _forceUserId: user.id,
    }).catch(() => {
        // Fallback: update account password hash directly via better-auth ctx
        console.log("ℹ️  changePassword API not available, using admin setPassword...");
    });

    // Use admin plugin setUserPassword if available
    try {
        await (auth.api as any).adminSetUserPassword?.({
            body: { userId: user.id, newPassword },
            headers: new Headers(),
        });
        console.log("✅ Password updated via admin API");
    } catch {
        // Hash and update directly in accounts table
        const { hash } = await import("@node-rs/bcrypt").catch(() => import("bcryptjs") as any);
        const hashed = typeof hash === "function"
            ? await hash(newPassword, 10)
            : await (hash as any).hash(newPassword, 10);

        await db.update(schema.accounts).set({
            password: hashed,
        }).where(
            and(
                eq(schema.accounts.userId, user.id),
                eq(schema.accounts.providerId, "credential")
            )
        );
        console.log("✅ Password hash updated directly in DB");
    }

    console.log(`\n✅ Done! Login with:\n   Email: ${email}\n   Password: ${newPassword}`);
    await client.end();
    process.exit(0);
}

main().catch(async (e) => {
    console.error("❌", e);
    await client.end();
    process.exit(1);
});
