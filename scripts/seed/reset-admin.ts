import { db } from "../../src/lib/db";
import { users, accounts } from "../../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import crypto from "crypto";

async function run() {
    const email = "nya.onmoseti@gmail.com";
    const password = "JengaAdmin2026!";

    let existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!existingUser) {
        console.log(`User ${email} not found. Creating it...`);
        const [newUser] = await db.insert(users).values({
            email,
            name: "Super Admin",
            role: "SuperAdmin"
        }).returning();
        existingUser = newUser;
    }

    const hashedPassword = await hashPassword(password);

    const existingAccount = await db.query.accounts.findFirst({
        where: eq(accounts.userId, existingUser.id),
    });

    if (existingAccount) {
        await db.update(accounts)
            .set({ password: hashedPassword })
            .where(eq(accounts.id, existingAccount.id));
        console.log(`Updated password for ${email}`);
    } else {
        await db.insert(accounts).values({
            id: crypto.randomUUID(),
            accountId: existingUser.id,
            providerId: "credential",
            userId: existingUser.id,
            password: hashedPassword,
        });
        console.log(`Created account and set password for ${email}`);
    }

    console.log(`Login: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
}

run().catch(console.error);
