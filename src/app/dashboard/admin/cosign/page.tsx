import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { suspensionCosigns, users } from "@/lib/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { normalizeRole } from "@/lib/auth/roles";
import CosignList, { type CosignRow } from "@/components/dashboard/Admin/CosignList";

export const metadata: Metadata = {
    title: "Suspension Co-sign | Jenga365",
    description: "Co-sign permanent suspensions (Three Strikes).",
};

export default async function CosignPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");
    if (normalizeRole((session.user as any)?.role) !== "SuperAdmin") redirect("/dashboard");

    const target = alias(users, "target_user");
    const requester = alias(users, "requesting_user");

    const rows = await db
        .select({
            id: suspensionCosigns.id,
            reason: suspensionCosigns.reason,
            strikeCount: suspensionCosigns.strikeCount,
            expiresAt: suspensionCosigns.expiresAt,
            targetName: target.name,
            targetEmail: target.email,
            requesterName: requester.name,
        })
        .from(suspensionCosigns)
        .leftJoin(target, eq(target.id, suspensionCosigns.userId))
        .leftJoin(requester, eq(requester.id, suspensionCosigns.requestedBy))
        .where(and(eq(suspensionCosigns.status, "pending"), sql`${suspensionCosigns.expiresAt} > now()`))
        .orderBy(desc(suspensionCosigns.createdAt))
        .catch(() => []);

    const pending: CosignRow[] = rows.map((r) => ({
        id: r.id,
        reason: r.reason,
        strikeCount: r.strikeCount,
        expiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString() : null,
        targetName: r.targetName ?? r.targetEmail ?? "Unknown user",
        requesterName: r.requesterName ?? "—",
    }));

    return (
        <div className="mx-auto max-w-3xl px-6 lg:px-8 py-8">
            <h1 className="text-display-sm text-foreground">Permanent suspension co-sign</h1>
            <p className="text-body-sm text-foreground-muted mt-1 mb-6">
                Three-Strikes suspensions require a second SuperAdmin signature before the account is banned.
            </p>
            <CosignList pending={pending} />
        </div>
    );
}
