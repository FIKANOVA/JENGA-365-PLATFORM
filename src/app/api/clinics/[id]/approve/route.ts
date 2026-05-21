import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireCapability } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { moderationLog } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireCapability("APPROVE_RUGBY_CLINIC");
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "FORBIDDEN";
        return NextResponse.json({ error: msg }, { status: msg === "UNAUTHORIZED" ? 401 : 403 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const { id } = await params;

    await db.insert(moderationLog).values({
        moderatorId: session!.user.id,
        actionType: "approve_clinic",
        targetId: id,
        targetType: "clinic",
        capability: "APPROVE_RUGBY_CLINIC",
    });

    return NextResponse.json({ ok: true });
}
