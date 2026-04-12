"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { userProfileAssets, users, menteeIntake } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { synthesizeUserProfile } from "../ai/profileSynthesizer";
import { getMentorMatches } from "../db/queries/matching";

/**
 * Saves a user asset (CV, Portfolio, LinkedIn) and triggers AI synthesis.
 */
export async function updateUserProfileAsset(params: {
    type: "CV" | "LinkedIn" | "Portfolio" | "Other";
    url?: string;
    filename?: string;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHORIZED");

    const userId = session.user.id;

    // 1. Update or Insert the asset
    await db.insert(userProfileAssets)
        .values({
            userId,
            ...params
        })
        .onConflictDoUpdate({
            target: [userProfileAssets.id], // Simplified, ideally unique on userId + type
            set: { ...params, updatedAt: new Date() }
        });

    // 2. Mark user embedding as stale to trigger re-synthesis
    await db.update(users)
        .set({ embeddingStale: true })
        .where(eq(users.id, userId));

    return { success: true };
}

/**
 * Explicitly triggers the AI synthesis process for the logged-in user.
 */
export async function triggerAiProfileSynthesis() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHORIZED");

    try {
        const result = await synthesizeUserProfile(session.user.id);
        return result;
    } catch (e: any) {
        console.error("AI Synthesis failed:", e);
        return { success: false, message: e.message };
    }
}

/**
 * Gets the best mentor matches for the currently logged in mentee.
 */
export async function getAiMentorMatches() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return [];

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { embedding: true, embeddingStale: true },
    });

    if (!user?.embedding || user.embeddingStale) return [];

    if (!Array.isArray(user.embedding)) return [];

    const intake = await db.query.menteeIntake.findFirst({
        where: eq(menteeIntake.userId, session.user.id),
        columns: { goalCategories: true },
    });

    return getMentorMatches({
        menteeEmbedding: user.embedding as number[],
        menteeGoalCategories: intake?.goalCategories ?? undefined,
        limit: 5,
    });
}
/**
 * Gets the best mentor matches for a specific mentee (used by Partners/Moderators).
 */
export async function getAiMentorMatchesForUser(menteeId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Authorization: Only Mentors, Partners, Moderators, and Admins can match others
    if (!session || !["Mentor", "CorporatePartner", "Moderator", "SuperAdmin"].includes((session.user as any).role)) {
        throw new Error("UNAUTHORIZED_FOR_MATCHING");
    }

    const mentee = await db.query.users.findFirst({
        where: eq(users.id, menteeId),
    });

    if (!mentee || !mentee.embedding) {
        return [];
    }

    const intake = await db.query.menteeIntake.findFirst({
        where: eq(menteeIntake.userId, menteeId),
        columns: { goalCategories: true },
    });

    const results = await getMentorMatches({
        menteeEmbedding: mentee.embedding as number[],
        menteeGoalCategories: intake?.goalCategories ?? undefined,
        limit: 5,
    });

    return results;
}
