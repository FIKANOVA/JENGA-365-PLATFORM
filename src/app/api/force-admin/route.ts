import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const email = "nya.onmoseti@gmail.com";
        const password = "JengaAdmin2026!";

        // Look for the user in the database this environment is actually connected to
        let u = await db.query.users.findFirst({ where: eq(users.email, email) });

        if (!u) {
            // User doesn't exist, use raw Drizzle insert to bypass any BetterAuth API context requirements
            const [newUser] = await db.insert(users).values({
                email,
                name: "Super Admin",
                role: "SuperAdmin"
            }).returning();
            u = newUser;
        } else {
            // Force role to SuperAdmin just in case
            await db.update(users).set({ role: "SuperAdmin" }).where(eq(users.id, u.id));
        }

        // Hash password
        const { hashPassword } = await import('better-auth/crypto');
        const hashedPassword = await hashPassword(password);
        
        // Update or insert account
        const acc = await db.query.accounts.findFirst({ where: eq(accounts.userId, u.id) });
        if (acc) {
            await db.update(accounts).set({ password: hashedPassword }).where(eq(accounts.id, acc.id));
        } else {
            const { randomUUID } = await import('node:crypto');
            await db.insert(accounts).values({
                id: randomUUID(),
                accountId: u.id, // Better Auth requires accountId to match the provider's user ID (or our internal user ID)
                providerId: "credential",
                userId: u.id,
                password: hashedPassword,
            });
        }

        return NextResponse.json({ success: true, msg: "SuperAdmin account created/updated perfectly. You can now log in." });
    } catch(err: any) {
        return NextResponse.json({ success: false, error: err.message, stack: err.stack });
    }
}
