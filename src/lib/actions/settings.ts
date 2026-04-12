"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import {
    users,
    mentorshipPairs,
    donations,
    moodJournal,
    userProfileAssets,
    activityLog,
} from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { headers } from "next/headers";

export async function updateProfile(data: {
    name?: string;
    locationRegion?: string;
    image?: string;
}) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");

    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.locationRegion !== undefined) updates.locationRegion = data.locationRegion;
    if (data.image !== undefined) updates.image = data.image;

    if (Object.keys(updates).length === 0) return { success: true };

    await db.update(users).set(updates).where(eq(users.id, session.user.id));
    return { success: true };
}

export async function requestDataExport() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");

    const userId = session.user.id;

    const [user, pairs, userDonations, journal, assets, logs] = await Promise.all([
        db.query.users.findFirst({ where: eq(users.id, userId) }),
        db
            .select()
            .from(mentorshipPairs)
            .where(
                or(
                    eq(mentorshipPairs.mentorId, userId),
                    eq(mentorshipPairs.menteeId, userId)
                )
            ),
        db.select().from(donations).where(eq(donations.userId, userId)),
        db.select().from(moodJournal).where(eq(moodJournal.menteeId, userId)),
        db.select().from(userProfileAssets).where(eq(userProfileAssets.userId, userId)),
        db
            .select()
            .from(activityLog)
            .where(eq(activityLog.userId, userId))
            .limit(500),
    ]);

    // Strip sensitive fields
    const safeUser = user
        ? { ...user, embedding: undefined, embeddingStale: undefined }
        : null;

    return {
        user: safeUser,
        mentorshipPairs: pairs,
        donations: userDonations,
        moodJournal: journal,
        profileAssets: assets,
        activityLog: logs,
        exportedAt: new Date().toISOString(),
    };
}
