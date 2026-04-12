import { db } from "../index";
import { users, ndaSignatures } from "../schema";
import { eq, and } from "drizzle-orm";

export async function getUserByEmail(email: string) {
    return db.query.users.findFirst({
        where: eq(users.email, email),
    });
}

export async function checkNDASignature(userId: string) {
    const signature = await db.query.ndaSignatures.findFirst({
        where: eq(ndaSignatures.userId, userId),
        orderBy: (t, { desc }) => [desc(t.signedAt)],
    });
    return !!signature;
}

export async function approveUser(userId: string, moderatorId: string) {
    return db.transaction(async (tx) => {
        await tx
            .update(users)
            .set({ isApproved: true })
            .where(eq(users.id, userId));

        // Log could be added here
    });
}
