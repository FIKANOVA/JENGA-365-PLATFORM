import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireCapability } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { corporateUnlockMilestones, corporateUnlockTriggers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ milestoneId: string }> }
) {
    try {
        await requireCapability("UNLOCK_CORPORATE_ESG_FUNDS");
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "FORBIDDEN";
        return NextResponse.json({ error: msg }, { status: msg === "UNAUTHORIZED" ? 401 : 403 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const { milestoneId } = await params;
    const body = await request.json().catch(() => ({})) as { evidenceUrl?: string; notes?: string };

    const [milestone] = await db
        .select()
        .from(corporateUnlockMilestones)
        .where(eq(corporateUnlockMilestones.id, milestoneId))
        .limit(1);

    if (!milestone) {
        return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const previousStatus = milestone.status ?? "LOCKED";

    await db.transaction(async (tx) => {
        await tx
            .update(corporateUnlockMilestones)
            .set({
                status: "UNLOCKED",
                verifiedAt: new Date(),
                verifiedBy: session!.user.id,
            })
            .where(eq(corporateUnlockMilestones.id, milestoneId));

        await tx.insert(corporateUnlockTriggers).values({
            milestoneId,
            kind: "manual_override",
            triggeredBy: session!.user.id,
            triggeredByRole: "SuperAdmin",
            previousStatus,
            newStatus: "UNLOCKED",
            evidenceUrl: body.evidenceUrl ?? null,
            notes: body.notes ?? null,
        });
    });

    return NextResponse.json({ ok: true });
}
