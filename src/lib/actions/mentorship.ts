"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { mentorshipPairs } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { createNotification } from "@/lib/notifications/service";

/**
 * Mentee requests a specific mentor — creates a pending pair.
 */
export async function requestMentor(mentorId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");

    const role = (session.user as any).role as string;
    if (role !== "Mentee") throw new Error("Only Mentees can request mentors");

    const menteeId = session.user.id;

    // Prevent duplicate pending requests
    const existing = await db.query.mentorshipPairs.findFirst({
        where: and(
            eq(mentorshipPairs.mentorId, mentorId),
            eq(mentorshipPairs.menteeId, menteeId)
        ),
    });
    if (existing) return { success: false, message: "Request already exists" };

    await db.insert(mentorshipPairs).values({
        mentorId,
        menteeId,
        status: "pending",
    });

    // Notify the mentor
    createNotification(mentorId, "new_match", {
        title: "New Mentee Request",
        body: "A mentee has requested you as their mentor. Review the request in your dashboard.",
        link: "/dashboard/mentor",
    }).catch(() => {});

    return { success: true };
}

/**
 * Mentor accepts a pending mentorship request.
 */
export async function acceptMentorRequest(pairId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");

    const pair = await db.query.mentorshipPairs.findFirst({
        where: and(
            eq(mentorshipPairs.id, pairId),
            eq(mentorshipPairs.mentorId, session.user.id),
            eq(mentorshipPairs.status, "pending")
        ),
    });
    if (!pair) throw new Error("Request not found or already actioned");

    await db.update(mentorshipPairs)
        .set({ status: "active" })
        .where(eq(mentorshipPairs.id, pairId));

    // Notify mentee
    createNotification(pair.menteeId, "match_accepted", {
        title: "Mentor Accepted Your Request",
        body: "Your mentor request has been accepted! Head to your dashboard to get started.",
        link: "/dashboard/mentee",
    }).catch(() => {});

    return { success: true };
}

/**
 * Mentor declines a pending mentorship request.
 */
export async function declineMentorRequest(pairId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");

    const pair = await db.query.mentorshipPairs.findFirst({
        where: and(
            eq(mentorshipPairs.id, pairId),
            eq(mentorshipPairs.mentorId, session.user.id),
            eq(mentorshipPairs.status, "pending")
        ),
    });
    if (!pair) throw new Error("Request not found or already actioned");

    await db.update(mentorshipPairs)
        .set({ status: "declined" })
        .where(eq(mentorshipPairs.id, pairId));

    createNotification(pair.menteeId, "match_declined", {
        title: "Mentor Request Declined",
        body: "Your mentor request was not accepted this time. Check your matches for other options.",
        link: "/dashboard/mentee",
    }).catch(() => {});

    return { success: true };
}
