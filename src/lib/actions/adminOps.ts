"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { corporatePartners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");
    if ((session.user as { role?: string }).role !== "SuperAdmin") {
        throw new Error("FORBIDDEN");
    }
    return session;
}

/**
 * Persist a partner's Looker Studio report id and/or login-free share URL.
 * These feed `src/components/dashboard/Partner/LookerEmbed.tsx` so the sponsor
 * sees their embedded ESG dashboard at /dashboard/partner.
 */
export async function setPartnerLooker(
    partnerId: string,
    lookerReportId: string,
    lookerShareUrl: string,
): Promise<{ ok: true } | { error: string }> {
    try {
        await requireSuperAdmin();
    } catch (err) {
        return { error: err instanceof Error ? err.message : "FORBIDDEN" };
    }

    const reportId = lookerReportId.trim() || null;
    const shareUrl = lookerShareUrl.trim() || null;

    await db
        .update(corporatePartners)
        .set({ lookerReportId: reportId, lookerShareUrl: shareUrl })
        .where(eq(corporatePartners.id, partnerId));

    revalidatePath("/dashboard/admin/esg-unlock");
    revalidatePath("/dashboard/partner");
    return { ok: true };
}
