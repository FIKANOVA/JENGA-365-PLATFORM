import { db } from "@/lib/db";
import {
    users,
    mentorshipPairs,
    sessionsLog,
    moodJournal,
    learningPathways,
    articles,
} from "@/lib/db/schema";
import { eq, and, desc, or, gte } from "drizzle-orm";

// ── Mentee ────────────────────────────────────────────────────────────────────

export async function getMenteeLearningPathway(menteeId: string) {
    // Find the mentee's active pair
    const pair = await db.query.mentorshipPairs.findFirst({
        where: and(
            eq(mentorshipPairs.menteeId, menteeId),
            or(
                eq(mentorshipPairs.status, "active"),
                eq(mentorshipPairs.status, "pending")
            )
        ),
    });

    if (!pair) return null;

    return db.query.learningPathways.findFirst({
        where: eq(learningPathways.pairId, pair.id),
    });
}

export async function getMenteeMoodJournal(menteeId: string, limit = 5) {
    return db
        .select()
        .from(moodJournal)
        .where(eq(moodJournal.menteeId, menteeId))
        .orderBy(desc(moodJournal.recordedAt))
        .limit(limit);
}

export async function getMenteeSessions(menteeId: string, limit = 5) {
    // Get pairs for this mentee, then sessions
    const pairs = await db
        .select({ id: mentorshipPairs.id })
        .from(mentorshipPairs)
        .where(eq(mentorshipPairs.menteeId, menteeId));

    if (pairs.length === 0) return [];

    const pairIds = pairs.map((p) => p.id);

    const allSessions = await Promise.all(
        pairIds.map((pairId) =>
            db
                .select()
                .from(sessionsLog)
                .where(eq(sessionsLog.pairId, pairId))
                .orderBy(desc(sessionsLog.sessionDate))
                .limit(limit)
        )
    );

    return allSessions.flat().slice(0, limit);
}

// ── Mentor ────────────────────────────────────────────────────────────────────

export async function getMentorPendingRequests(mentorId: string) {
    const pairs = await db
        .select({
            id: mentorshipPairs.id,
            menteeId: mentorshipPairs.menteeId,
            matchedAt: mentorshipPairs.matchedAt,
            matchScore: mentorshipPairs.matchScore,
        })
        .from(mentorshipPairs)
        .where(
            and(
                eq(mentorshipPairs.mentorId, mentorId),
                eq(mentorshipPairs.status, "pending")
            )
        )
        .orderBy(desc(mentorshipPairs.matchedAt))
        .limit(10);

    if (pairs.length === 0) return [];

    // Fetch mentee user details
    const menteeIds = pairs.map((p) => p.menteeId);
    const menteeUsers = await db
        .select({ id: users.id, name: users.name, image: users.image, locationRegion: users.locationRegion })
        .from(users)
        .where(
            menteeIds.length === 1
                ? eq(users.id, menteeIds[0])
                : or(...menteeIds.map((id) => eq(users.id, id)))
        );

    const userMap = Object.fromEntries(menteeUsers.map((u) => [u.id, u]));

    return pairs.map((p) => ({
        pairId: p.id,
        matchedAt: p.matchedAt,
        matchScore: p.matchScore,
        mentee: userMap[p.menteeId] ?? null,
    }));
}

export async function getMentorActiveMentees(mentorId: string) {
    const pairs = await db
        .select({
            id: mentorshipPairs.id,
            menteeId: mentorshipPairs.menteeId,
            matchedAt: mentorshipPairs.matchedAt,
        })
        .from(mentorshipPairs)
        .where(
            and(
                eq(mentorshipPairs.mentorId, mentorId),
                eq(mentorshipPairs.status, "active")
            )
        )
        .orderBy(desc(mentorshipPairs.matchedAt))
        .limit(20);

    if (pairs.length === 0) return [];

    const menteeIds = pairs.map((p) => p.menteeId);
    const menteeUsers = await db
        .select({ id: users.id, name: users.name, image: users.image })
        .from(users)
        .where(
            menteeIds.length === 1
                ? eq(users.id, menteeIds[0])
                : or(...menteeIds.map((id) => eq(users.id, id)))
        );

    const userMap = Object.fromEntries(menteeUsers.map((u) => [u.id, u]));
    return pairs.map((p) => ({ pairId: p.id, mentee: userMap[p.menteeId] ?? null }));
}

export async function getMentorUpcomingSessions(mentorId: string, limit = 5) {
    const pairs = await db
        .select({ id: mentorshipPairs.id, menteeId: mentorshipPairs.menteeId })
        .from(mentorshipPairs)
        .where(eq(mentorshipPairs.mentorId, mentorId));

    if (pairs.length === 0) return [];

    const now = new Date();
    const allSessions: Array<{
        id: string;
        pairId: string;
        sessionDate: Date;
        durationMinutes: number;
        notes: string | null;
        menteeName?: string;
    }> = [];

    const menteeIds = Object.fromEntries(pairs.map((p) => [p.id, p.menteeId]));
    const menteeUsers = await db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(or(...pairs.map((p) => eq(users.id, p.menteeId))));
    const userMap = Object.fromEntries(menteeUsers.map((u) => [u.id, u.name]));

    for (const pair of pairs) {
        const sessions = await db
            .select()
            .from(sessionsLog)
            .where(
                and(
                    eq(sessionsLog.pairId, pair.id),
                    gte(sessionsLog.sessionDate, now)
                )
            )
            .orderBy(desc(sessionsLog.sessionDate))
            .limit(3);

        for (const s of sessions) {
            allSessions.push({
                ...s,
                menteeName: userMap[menteeIds[pair.id]] ?? undefined,
            });
        }
    }

    return allSessions
        .sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime())
        .slice(0, limit);
}

// ── Moderator ─────────────────────────────────────────────────────────────────

export async function getArticlesInReview(limit = 20) {
    return db
        .select({
            id: articles.id,
            title: articles.title,
            authorId: articles.authorId,
            category: articles.category,
            submittedForReviewAt: articles.submittedForReviewAt,
        })
        .from(articles)
        .where(eq(articles.status, "in_review"))
        .orderBy(desc(articles.submittedForReviewAt))
        .limit(limit);
}

export async function getPendingUsers(limit = 20) {
    return db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            image: users.image,
            locationRegion: users.locationRegion,
            metadata: users.metadata,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.isApproved, false))
        .orderBy(desc(users.createdAt))
        .limit(limit);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function getAllUsers(limit = 50) {
    return db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            status: users.status,
            isApproved: users.isApproved,
            image: users.image,
            locationRegion: users.locationRegion,
            metadata: users.metadata,
            moderationScope: users.moderationScope,
            createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit);
}
