import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resilienceAssessments } from "@/lib/db/schema";
import { createNotification } from "@/lib/notifications/service";
import { and, eq, isNull, lte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const due = await db
        .select({ userId: resilienceAssessments.userId, id: resilienceAssessments.id })
        .from(resilienceAssessments)
        .where(
            and(
                eq(resilienceAssessments.isBaseline, true),
                lte(resilienceAssessments.reassessmentDueDate, sql`now()`),
                isNull(
                    sql`(
                        SELECT id FROM resilience_assessments r2
                        WHERE r2.user_id = ${resilienceAssessments.userId}
                          AND r2.is_baseline = false
                        LIMIT 1
                    )`
                )
            )
        );

    await Promise.all(
        due.map((row) =>
            createNotification(row.userId, "general", {
                title: "Resilience check-in due",
                body: "It's time to complete your follow-up resilience assessment.",
                link: "/onboarding/resilience?reassess=1",
            })
        )
    );

    return NextResponse.json({ notified: due.length });
}
