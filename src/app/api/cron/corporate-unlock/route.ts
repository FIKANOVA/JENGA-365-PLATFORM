import { NextResponse } from "next/server";
import { checkAndUnlockMilestones } from "@/lib/actions/corporateUnlock";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/corporate-unlock
 *
 * Nightly safety-net cron — re-evaluates ALL locked milestones across all types.
 * Catches any milestones the real-time KoboToolbox webhook may have missed.
 *
 * The unlock logic lives in checkAndUnlockMilestones — this route is intentionally thin.
 *
 * Cadence: 0 2 * * * (2:00 AM nightly)
 */
export async function GET(req: Request) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await checkAndUnlockMilestones(); // no filter — checks all milestone types
        return NextResponse.json({ success: true, message: "Milestone check complete." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
