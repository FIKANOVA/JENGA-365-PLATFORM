import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { treeSurvivalChecks } from "@/lib/db/schema";
import { checkAndUnlockMilestones } from "@/lib/actions/corporateUnlock";

export const dynamic = "force-dynamic";

/**
 * KoboToolbox payload schema — mirrors our tree_survival_checks table.
 * Field names follow KoboToolbox's export convention (_id, _geolocation, etc.).
 * passthrough() archives unknown fields in rawPayload for future re-derivation.
 */
const KoboPayloadSchema = z.object({
    _id: z.union([z.string(), z.number()]).transform(String),
    _submission_time: z.string(),
    trees_planted: z.coerce.number().int().nonnegative(),
    trees_alive: z.coerce.number().int().nonnegative(),
    check_interval_months: z.coerce.number().int(),
    survey_date: z.string(),
    surveyor_name: z.string().optional(),
    _geolocation: z.tuple([z.number(), z.number()]).nullable().optional(),
    _attachments: z.array(z.object({ download_url: z.string() })).optional(),
}).passthrough();

/**
 * POST /api/webhooks/kobo
 *
 * Receives KoboToolbox field-audit submissions for "The Green Game" tree survival checks.
 *
 * Auth:    x-kobo-token header matched against KOBO_WEBHOOK_SECRET env var.
 * Safety:  ON CONFLICT DO NOTHING — duplicate submission IDs are silently ignored.
 * Speed:   Milestone check fires asynchronously so we respond before it completes.
 *          KoboToolbox has a short response timeout; we must not block on DB work.
 */
export async function POST(req: Request) {
    // ── Auth guard ────────────────────────────────────────────────────────────
    const token = req.headers.get("x-kobo-token");
    if (!token || token !== process.env.KOBO_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    let rawBody: unknown;
    try {
        rawBody = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = KoboPayloadSchema.safeParse(rawBody);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid payload", issues: parsed.error.issues },
            { status: 422 }
        );
    }

    const data = parsed.data;
    const [geoLat, geoLng] = data._geolocation ?? [null, null];
    const photoUrl = data._attachments?.[0]?.download_url ?? null;

    // ── Idempotent insert ─────────────────────────────────────────────────────
    await db
        .insert(treeSurvivalChecks)
        .values({
            koboSubmissionId: data._id,
            checkIntervalMonths: data.check_interval_months,
            surveyDate: new Date(data.survey_date),
            treesPlanted: data.trees_planted,
            treesAlive: data.trees_alive,
            surveyorName: data.surveyor_name ?? null,
            photoUrl,
            geoLat: geoLat != null ? String(geoLat) : null,
            geoLng: geoLng != null ? String(geoLng) : null,
            rawPayload: rawBody as Record<string, unknown>,
        })
        .onConflictDoNothing({ target: treeSurvivalChecks.koboSubmissionId });

    // ── Trigger milestone check asynchronously — do not block the response ────
    void checkAndUnlockMilestones("tree_survival");

    return NextResponse.json({ received: true }, { status: 200 });
}
