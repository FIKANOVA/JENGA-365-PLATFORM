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

    // Validate up front so the operator gets a clear message instead of a raw DB
    // CHECK-constraint error (corporate_partners_looker_share_url_format, migration 0009).
    if (shareUrl && !shareUrl.startsWith("https://lookerstudio.google.com/")) {
        return { error: "Share URL must start with https://lookerstudio.google.com/" };
    }
    // reportId becomes part of the embed iframe src — keep it to a safe token charset.
    if (reportId && !/^[A-Za-z0-9_-]+$/.test(reportId)) {
        return { error: "Report ID may contain only letters, numbers, hyphens and underscores." };
    }

    try {
        await db
            .update(corporatePartners)
            .set({ lookerReportId: reportId, lookerShareUrl: shareUrl })
            .where(eq(corporatePartners.id, partnerId));
    } catch (err) {
        console.error("[setPartnerLooker] update failed:", err);
        return { error: "Could not save Looker settings. Check the report ID and share URL." };
    }

    revalidatePath("/dashboard/admin/esg-unlock");
    revalidatePath("/dashboard/partner");
    return { ok: true };
}
