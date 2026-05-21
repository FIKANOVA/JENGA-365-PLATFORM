import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireCapability } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { suspensionCosigns, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireCapability("COSIGN_PERMANENT_SUSPENSION");
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "FORBIDDEN";
        return NextResponse.json({ error: msg }, { status: msg === "UNAUTHORIZED" ? 401 : 403 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const { id } = await params;

    const [cosign] = await db
        .select()
        .from(suspensionCosigns)
        .where(
            and(
                eq(suspensionCosigns.id, id),
                eq(suspensionCosigns.status, "pending"),
                sql`${suspensionCosigns.expiresAt} > now()`
            )
        )
        .limit(1);

    if (!cosign) {
        return NextResponse.json({ error: "Not found or already processed" }, { status: 404 });
    }

    await db.transaction(async (tx) => {
        await tx
            .update(suspensionCosigns)
            .set({
                status: "cosigned",
                cosignerId: session!.user.id,
                cosignedAt: new Date(),
            })
            .where(eq(suspensionCosigns.id, id));

        await tx
            .update(users)
            .set({
                status: "suspended",
                banned: true,
                banReason: cosign.reason,
            })
            .where(eq(users.id, cosign.userId));
    });

    return NextResponse.json({ ok: true });
}
