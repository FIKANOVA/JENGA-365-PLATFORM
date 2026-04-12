"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import {
    users,
    mentorshipPairs,
    sessionsLog,
    learningPathways,
    userBadges,
    activityLog,
    menteeDocuments,
    moderationLog
} from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";
import { createNotification } from "@/lib/notifications/service";

// ── ACTION 1: getMenteeDetail ──────────────────────────────────

export async function getMenteeDetail(menteeId: string) {
    // 1. Verify session
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHENTICATED");

    // 2. Role guard
    const allowedRoles = ["SuperAdmin", "Moderator", "CorporatePartner"];
    if (!allowedRoles.includes((session.user as any).role)) {
        throw new Error("FORBIDDEN");
    }

    // 3. Ownership check (CorporatePartner only)
    if ((session.user as any).role === "CorporatePartner") {
        if (!(session.user as any).partnerId) throw new Error("FORBIDDEN: NO_PARTNER_LINK");
 
        // Verify mentee is linked to this partner
        const pairs = await db.select()
            .from(mentorshipPairs)
            .where(
                and(
                    eq(mentorshipPairs.menteeId, menteeId),
                    eq(mentorshipPairs.partnerId, (session.user as any).partnerId)
                )
            )
            .limit(1);
 
        if (pairs.length === 0) throw new Error("FORBIDDEN: NOT_YOUR_MENTEE");
    }

    // 4. DB query
    const mentee = await db.query.users.findFirst({
        where: eq(users.id, menteeId),
        with: {
            // Assuming relations are defined in schema, if not we join manually
            // Based on schema.ts view, relations are NOT explicitly defined with 'relations' helper
            // So we do manual selects if needed or join. Let's do separate queries for safety
        }
    });

    if (!mentee) throw new Error("NOT_FOUND");

    const pair = await db.query.mentorshipPairs.findFirst({
        where: eq(mentorshipPairs.menteeId, menteeId),
        with: {
            mentor: true
        }
    });

    const sessions = await db.select()
        .from(sessionsLog)
        .where(eq(sessionsLog.pairId, pair?.id || ""))
        .orderBy(desc(sessionsLog.sessionDate));

    const pathway = await db.query.learningPathways.findFirst({
        where: eq(learningPathways.pairId, pair?.id || ""),
    });

    const badges = await db.select()
        .from(userBadges)
        .where(eq(userBadges.userId, menteeId));

    const activity = await db.select()
        .from(activityLog)
        .where(eq(activityLog.userId, menteeId))
        .orderBy(desc(activityLog.createdAt))
        .limit(20);

    const documents = await db.select()
        .from(menteeDocuments)
        .where(eq(menteeDocuments.menteeId, menteeId));

    return {
        mentee,
        pair,
        sessions,
        pathway,
        badges,
        activity,
        documents
    };
}

// ── ACTION 2: logMentorshipSession ────────────────────────────

const logSessionSchema = z.object({
    menteeId: z.string().uuid(),
    mentorId: z.string().uuid(),
    sessionDate: z.date(),
    durationMinutes: z.number().min(15).max(180),
    sessionType: z.enum(["video_call", "in_person", "messaging"]),
    milestoneId: z.string().uuid().optional(),
    notes: z.string().min(10).max(2000),
    rating: z.number().min(1).max(5),
    nextSteps: z.string().max(1000).optional(),
    nextSessionDate: z.date().optional(),
});

export async function logMentorshipSession(input: z.infer<typeof logSessionSchema>) {
    // 1. Auth check
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHENTICATED");

    // 2. Role guard (Mentor or CorporatePartner)
    if ((session.user as any).role !== "Mentor" && (session.user as any).role !== "CorporatePartner" && (session.user as any).role !== "SuperAdmin") {
        throw new Error("FORBIDDEN");
    }

    // 3. Validate input
    const parsed = logSessionSchema.parse(input);

    // 4. Verify linking
    const pair = await db.query.mentorshipPairs.findFirst({
        where: and(
            eq(mentorshipPairs.menteeId, parsed.menteeId),
            eq(mentorshipPairs.mentorId, parsed.mentorId)
        )
    });

    if (!pair) throw new Error("PAIR_NOT_FOUND");

    // 5. DB Operation
    const [newSession] = await db.insert(sessionsLog).values({
        pairId: pair.id,
        durationMinutes: parsed.durationMinutes,
        notes: parsed.notes,
        sessionDate: parsed.sessionDate,
        loggedBy: session.user.id,
    }).returning();

    // Update milestone if provided
    if (parsed.milestoneId) {
        // Logic to update learning_pathways milestones array
        const pathway = await db.query.learningPathways.findFirst({
            where: eq(learningPathways.pairId, pair.id)
        });

        if (pathway) {
            const milestones = pathway.milestones as any[];
            const updatedMilestones = milestones.map(m =>
                m.id === parsed.milestoneId ? { ...m, status: "completed", completionDate: new Date() } : m
            );

            await db.update(learningPathways)
                .set({
                    milestones: updatedMilestones,
                    progress: Math.round((updatedMilestones.filter(m => m.status === "completed").length / updatedMilestones.length) * 100)
                })
                .where(eq(learningPathways.id, pathway.id));
        }
    }

    // 6. Activity log
    await db.insert(activityLog).values({
        userId: parsed.menteeId,
        actionType: "session_completed",
        entityId: newSession.id,
        impactPoints: 10,
    });

    createNotification(parsed.menteeId, "session_reminder", {
        title: "Session Logged",
        body: `Your mentorship session on ${parsed.sessionDate.toLocaleDateString()} has been recorded.`,
        link: "/dashboard/mentee",
    }).catch(() => {}); // fire-and-forget — never fail the session log

    return { success: true, sessionId: newSession.id };
}

// ── ACTION 3: updateMilestoneStatus ───────────────────────────

const milestoneStatusSchema = z.object({
    milestoneId: z.string().uuid(),
    pairId: z.string().uuid(),
    status: z.enum(["not_started", "in_progress", "completed"]),
    completionDate: z.date().optional(),
    notes: z.string().max(500).optional(),
});

export async function updateMilestoneStatus(input: z.infer<typeof milestoneStatusSchema>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHENTICATED");

    const allowedRoles = ["Mentor", "Moderator", "SuperAdmin"];
    if (!allowedRoles.includes((session.user as any).role)) throw new Error("FORBIDDEN");

    const parsed = milestoneStatusSchema.parse(input);

    const pathway = await db.query.learningPathways.findFirst({
        where: eq(learningPathways.pairId, parsed.pairId)
    });

    if (!pathway) throw new Error("PATHWAY_NOT_FOUND");

    const milestones = pathway.milestones as any[];
    const updatedMilestones = milestones.map(m =>
        m.id === parsed.milestoneId ? { ...m, status: parsed.status, completionDate: parsed.completionDate || m.completionDate, notes: parsed.notes || m.notes } : m
    );

    const completedCount = updatedMilestones.filter(m => m.status === "completed").length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    await db.update(learningPathways)
        .set({
            milestones: updatedMilestones,
            progress,
            lastUpdated: new Date()
        })
        .where(eq(learningPathways.id, pathway.id));

    if (progress === 100) {
        await db.update(mentorshipPairs)
            .set({ status: "completed" })
            .where(eq(mentorshipPairs.id, parsed.pairId));

        // Trigger: award certificate badge (placeholder)
        console.log("Awarding certificate badge...");
    }

    await db.insert(activityLog).values({
        userId: session.user.id, // logged by user
        actionType: "milestone_updated",
        entityId: pathway.id,
    });

    return { success: true };
}

// ── ACTION 4: flagMentee ──────────────────────────────────────

const flagMenteeSchema = z.object({
    menteeId: z.string().uuid(),
    flagType: z.enum([
        "missed_sessions", "behaviour", "content_violation",
        "inactivity", "other"
    ]),
    description: z.string().min(20).max(500),
    severity: z.enum(["low", "medium", "high"]),
});

export async function flagMentee(input: z.infer<typeof flagMenteeSchema>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHENTICATED");

    const allowedRoles = ["Mentor", "Moderator", "SuperAdmin"];
    if (!allowedRoles.includes((session.user as any).role)) throw new Error("FORBIDDEN");

    const parsed = flagMenteeSchema.parse(input);

    const [moderation] = await db.insert(moderationLog).values({
        moderatorId: session.user.id,
        actionType: `flag_${parsed.flagType}`,
        targetId: parsed.menteeId,
        targetType: "user",
        notes: `[Severity: ${parsed.severity}] ${parsed.description}`,
    }).returning();

    if (parsed.severity === "high") {
        console.log("Notifying SuperAdmin immediately of High Severity flag!");
    }

    await db.insert(activityLog).values({
        userId: session.user.id,
        actionType: "mentee_flagged",
        entityId: moderation.id,
    });

    return { success: true };
}

// ── ACTION 5: uploadMenteeDocument ────────────────────────────

export async function uploadMenteeDocument(menteeId: string, documentName: string, documentUrl: string, documentType: string, fileSizeBytes: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHENTICATED");

    // simplified: we assume client handles upload to R2 and just sends us the link here for DB record
    // or we'd generate a presigned URL here. 

    const [doc] = await db.insert(menteeDocuments).values({
        menteeId,
        uploadedBy: session.user.id,
        documentName,
        documentUrl,
        documentType,
        fileSizeBytes,
    }).returning();

    return { success: true, document: doc };
}
// ── ACTION 6: assignMentor ────────────────────────────────────

const assignMentorSchema = z.object({
    menteeId: z.string().uuid(),
    mentorId: z.string().uuid(),
    matchScore: z.number().optional(),
});

export async function assignMentor(input: z.infer<typeof assignMentorSchema>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHENTICATED");

    const allowedRoles = ["SuperAdmin", "Moderator", "CorporatePartner"];
    if (!allowedRoles.includes((session.user as any).role)) throw new Error("FORBIDDEN");

    const parsed = assignMentorSchema.parse(input);

    // 1. Transaction to ensure pair and pathway are created together
    return await db.transaction(async (tx) => {
        // Upsert the pair
        const [pair] = await tx.insert(mentorshipPairs)
            .values({
                menteeId: parsed.menteeId,
                mentorId: parsed.mentorId,
                matchScore: parsed.matchScore?.toString(), // Decimal in DB
                partnerId: (session.user as any).partnerId,
                status: "active"
            })
            .onConflictDoUpdate({
                target: [mentorshipPairs.mentorId, mentorshipPairs.menteeId],
                set: {
                    status: "active",
                    matchScore: parsed.matchScore?.toString(),
                    matchedAt: new Date()
                }
            })
            .returning();

        // Initialize learning pathway if not exists
        await tx.insert(learningPathways)
            .values({
                pairId: pair.id,
                milestones: [
                    { id: crypto.randomUUID(), title: "Introductory Meeting", status: "not_started" },
                    { id: crypto.randomUUID(), title: "Personal Goal Setting", status: "not_started" },
                    { id: crypto.randomUUID(), title: "Skill Assessment", status: "not_started" }
                ],
                progress: 0
            })
            .onConflictDoNothing();

        // Log activity
        await tx.insert(activityLog).values({
            userId: parsed.menteeId,
            actionType: "mentor_assigned",
            entityId: pair.id,
        });

        return { success: true, pairId: pair.id };
    });
}
