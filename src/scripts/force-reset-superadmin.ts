
import "dotenv/config";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function main() {
    console.log("🔥 Force Resetting SuperAdmin...");

    const email = process.env.SUPERADMIN_EMAIL;
    const tempPassword = process.env.SUPERADMIN_TEMP_PASSWORD;

    if (!email || !tempPassword) {
        console.error("❌ SUPERADMIN_EMAIL and SUPERADMIN_TEMP_PASSWORD must be set in .env");
        process.exit(1);
    }

    try {
        // 1. Find existing user
        const existing = await db.query.users.findFirst({
            where: eq(schema.users.email, email)
        });

        if (existing) {
            console.log(`🗑️  Deleting existing user ${email}...`);
            // Better Auth links users to sessions, accounts, etc.
            // We should delete related records first to avoid FK errors, or just use CASCADE if DB supports it.
            // Let's do it manually to be safe.
            await db.delete(schema.accounts).where(eq(schema.accounts.userId, existing.id));
            await db.delete(schema.sessions).where(eq(schema.sessions.userId, existing.id));
            await db.delete(schema.users).where(eq(schema.users.id, existing.id));
        }

        // 2. Clear out any existing invite links for this email/inviter to start fresh
        // (Invite links might be linked to the old userId)
        await db.delete(schema.inviteLinks);

        console.log(`🌱 Recreating user via Auth API...`);
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password: tempPassword,
                name: "Super Admin",
            }
        });

        if (!result) throw new Error("SignUp failed");

        // 3. Get the new user
        const newUser = await db.query.users.findFirst({
            where: eq(schema.users.email, email)
        });
        if (!newUser) throw new Error("Could not find new user");

        // 4. Set roles and status
        await db.update(schema.users)
            .set({
                role: "SuperAdmin" as any,
                emailVerified: true,
                isApproved: true,
                status: "active"
            })
            .where(eq(schema.users.id, newUser.id));

        // 5. Create new invite token
        const token = randomUUID();
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        await db.insert(schema.inviteLinks).values({
            inviterId: newUser.id,
            token: token,
            roleAssigned: "SuperAdmin",
            isUsed: false,
            expiresAt: expiresAt,
        });

        console.log(`✅ Success! SuperAdmin recreated.`);
        console.log(`🔑 Temp Password: ${tempPassword}`);
        console.log(`🔗 Token restored: ${token}`);

    } catch (err: any) {
        console.log('❌ Failed:');
        console.dir(err, { depth: null });
    } finally {
        process.exit(0);
    }
}

main();
