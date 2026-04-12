"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

const ROLE_DASHBOARD: Record<string, string> = {
    Mentee: "/dashboard/mentee",
    Mentor: "/dashboard/mentor",
    CorporatePartner: "/dashboard/partner",
    Moderator: "/dashboard/moderator",
    SuperAdmin: "/dashboard/admin",
};

const ROLES_NEEDING_APPROVAL = new Set(["Mentor", "CorporatePartner"]);

export async function completeOnboarding(_summary: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id;
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user) throw new Error("User not found");

    const needsApproval = ROLES_NEEDING_APPROVAL.has(user.role);
    const newStatus = needsApproval ? "pending_approval" : "active";
    const redirectTo = needsApproval
        ? "/pending-approval"
        : (ROLE_DASHBOARD[user.role] ?? "/dashboard/mentee");

    await db.update(users)
        .set({ onboarded: true, status: newStatus })
        .where(eq(users.id, userId));

    if (!needsApproval) {
        import("@/lib/ai/profileSynthesizer")
            .then(({ synthesizeUserProfile }) => synthesizeUserProfile(userId))
            .catch((e: Error) => console.error("[onboarding] Background synthesis failed:", e));
    }

    return { success: true, redirectTo };
}
