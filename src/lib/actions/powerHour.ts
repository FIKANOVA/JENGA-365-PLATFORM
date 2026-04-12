import { db } from "@/lib/db";
import { powerHourSessions, mentorCommitmentTracker } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Logs a Power Hour mentoring session and upserts the mentor's monthly commitment tracker.
 * The 60-minute monthly threshold is checked via SQL on upsert to avoid read-modify-write races.
 */
export async function logPowerHourSession(params: {
    mentorId: string;
    menteeId?: string;
    sessionDate: Date;
    durationMinutes: number;
    notes?: string;
}): Promise<{ sessionId: string; month: string }> {
    const month = params.sessionDate.toISOString().slice(0, 7); // '2026-04'

    // Insert session record
    const [session] = await db
        .insert(powerHourSessions)
        .values({
            mentorId: params.mentorId,
            menteeId: params.menteeId ?? null,
            sessionDate: params.sessionDate,
            durationMinutes: params.durationMinutes,
            notes: params.notes ?? null,
        })
        .returning({ id: powerHourSessions.id });

    // Upsert commitment tracker — increment hoursLogged, flip to 'met' when >= 60
    await db
        .insert(mentorCommitmentTracker)
        .values({
            mentorId: params.mentorId,
            month,
            hoursLogged: params.durationMinutes,
            status: params.durationMinutes >= 60 ? "met" : "at_risk",
        })
        .onConflictDoUpdate({
            target: [mentorCommitmentTracker.mentorId, mentorCommitmentTracker.month],
            set: {
                hoursLogged: sql`${mentorCommitmentTracker.hoursLogged} + ${params.durationMinutes}`,
                status: sql`CASE WHEN ${mentorCommitmentTracker.hoursLogged} + ${params.durationMinutes} >= 60 THEN 'met' ELSE ${mentorCommitmentTracker.status} END`,
            },
        });

    return { sessionId: session.id, month };
}

/**
 * Returns the mentor's commitment tracker row for a given month, or null if none exists.
 */
export async function getMonthlyCommitmentStatus(
    mentorId: string,
    month: string
): Promise<typeof mentorCommitmentTracker.$inferSelect | null> {
    const [row] = await db
        .select()
        .from(mentorCommitmentTracker)
        .where(
            and(
                eq(mentorCommitmentTracker.mentorId, mentorId),
                eq(mentorCommitmentTracker.month, month)
            )
        )
        .limit(1);

    return row ?? null;
}
