"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import {
    users,
    mentorshipPairs,
    donations,
    projectLocations,
} from "@/lib/db/schema";
import { and, eq, count, sum, inArray } from "drizzle-orm";
import { headers } from "next/headers";

export async function getCsrStats(partnerId?: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");

    const role = (session.user as any).role as string;
    const sessionPartnerId = (session.user as any).partnerId as string | undefined;

    // Resolve the partner ID: explicit arg → session field → error
    const pid = partnerId ?? sessionPartnerId;
    if (!pid) throw new Error("No partner ID found");

    // Only CorporatePartner, Moderator, or SuperAdmin can access CSR stats
    if (!["CorporatePartner", "Moderator", "SuperAdmin"].includes(role)) {
        throw new Error("UNAUTHORIZED");
    }

    // 1. Mentees linked to this partner
    const [menteesRow] = await db
        .select({ count: count() })
        .from(users)
        .where(and(eq(users.partnerId, pid), eq(users.role, "Mentee")));

    // 2. Active mentorship pairs funded by this partner
    const [activePairsRow] = await db
        .select({ count: count() })
        .from(mentorshipPairs)
        .where(
            and(eq(mentorshipPairs.partnerId, pid), eq(mentorshipPairs.status, "active"))
        );

    // 3. Donations from users linked to this partner
    const partnerUserIds = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.partnerId, pid));

    let donationsTotal = 0;
    if (partnerUserIds.length > 0) {
        const ids = partnerUserIds.map((u) => u.id);
        const [donationsRow] = await db
            .select({ total: sum(donations.amount) })
            .from(donations)
            .where(inArray(donations.userId, ids));
        donationsTotal = Number(donationsRow?.total ?? 0);
    }

    // 4. Projects / locations funded by this partner
    const [projectsRow] = await db
        .select({ count: count() })
        .from(projectLocations)
        .where(eq(projectLocations.funderId, pid));

    return {
        menteesSponsored: menteesRow?.count ?? 0,
        activeMentorships: activePairsRow?.count ?? 0,
        donationsTotal,
        projectsFunded: projectsRow?.count ?? 0,
    };
}
