import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { treeSurvivalChecks, treeSurvivalAudits, giveBackTracking } from "@/lib/db/schema";
import { checkAndUnlockMilestones } from "@/lib/actions/corporateUnlock";

const KoboTreeSchema = z.object({
    form_type: z.literal("tree_survival"),
    _id: z.string(),
    _submission_time: z.string(),
    trees_planted: z.number(),
    trees_alive: z.number(),
    check_interval_months: z.number(),
    survey_date: z.string(),
    surveyor_name: z.string().optional(),
    project_location_id: z.string().uuid().optional(),
    _geolocation: z.tuple([z.number(), z.number()]).optional(),
    _attachments: z.array(z.object({ download_url: z.string() })).optional(),
    raw_payload: z.record(z.string(), z.unknown()).optional(),
});

const KoboGiveBackSchema = z.object({
    form_type: z.literal("give_back"),
    _id: z.string(),
    user_id: z.string().uuid(),
    quarter: z.string(),
    activity_type: z.string().optional(),
    activity_description: z.string().optional(),
    _geolocation: z.tuple([z.number(), z.number()]).optional(),
    _attachments: z.array(z.object({ download_url: z.string() })).optional(),
});

const KoboPayloadSchema = z.discriminatedUnion("form_type", [
    KoboTreeSchema,
    KoboGiveBackSchema,
]);

export async function POST(request: NextRequest) {
    const token = request.headers.get("x-kobo-token");
    if (!token || token !== process.env.KOBO_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = KoboPayloadSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 422 });
    }

    const payload = parsed.data;

    void (async () => {
        if (payload.form_type === "tree_survival") {
            const [lat, lng] = payload._geolocation ?? [];
            const photoUrl = payload._attachments?.[0]?.download_url ?? null;

            const [inserted] = await db
                .insert(treeSurvivalChecks)
                .values({
                    koboSubmissionId: payload._id,
                    projectLocationId: payload.project_location_id ?? null,
                    checkIntervalMonths: payload.check_interval_months,
                    surveyDate: new Date(payload.survey_date),
                    treesPlanted: payload.trees_planted,
                    treesAlive: payload.trees_alive,
                    surveyorName: payload.surveyor_name ?? null,
                    photoUrl,
                    geoLat: lat != null ? String(lat) : null,
                    geoLng: lng != null ? String(lng) : null,
                    rawPayload: payload.raw_payload ?? (body as Record<string, unknown>),
                })
                .onConflictDoNothing()
                .returning({ id: treeSurvivalChecks.id, treesAlive: treeSurvivalChecks.treesAlive, treesPlanted: treeSurvivalChecks.treesPlanted });

            if (inserted) {
                const survivalRate = inserted.treesPlanted > 0
                    ? (inserted.treesAlive / inserted.treesPlanted) * 100
                    : 0;
                await db.insert(treeSurvivalAudits).values({
                    checkId: inserted.id,
                    action: "ingested",
                    actorId: null,
                    actorRole: null,
                    newSurvivalRate: String(Math.round(survivalRate * 100) / 100),
                });
            }

            await checkAndUnlockMilestones("tree_survival");
        } else {
            const [lat, lng] = payload._geolocation ?? [];
            const photoUrl = payload._attachments?.[0]?.download_url ?? null;

            await db
                .insert(giveBackTracking)
                .values({
                    userId: payload.user_id,
                    quarter: payload.quarter,
                    activityType: payload.activity_type ?? null,
                    activityDescription: payload.activity_description ?? null,
                    koboSubmissionId: payload._id,
                    geoLat: lat != null ? String(lat) : null,
                    geoLng: lng != null ? String(lng) : null,
                    photoUrl,
                })
                .onConflictDoNothing();
        }
    })();

    return NextResponse.json({ received: true });
}
