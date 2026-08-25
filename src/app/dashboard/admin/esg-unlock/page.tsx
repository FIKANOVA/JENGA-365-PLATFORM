import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { corporateUnlockMilestones, corporatePartners, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { normalizeRole } from "@/lib/auth/roles";
import EsgUnlockPanel, { type MilestoneRow, type PartnerLookerRow } from "@/components/dashboard/Admin/EsgUnlockPanel";

export const metadata: Metadata = {
    title: "ESG Unlock | Jenga365",
    description: "Manually unlock corporate ESG milestones and configure Looker dashboards.",
};

export default async function EsgUnlockPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");
    if (normalizeRole((session.user as any)?.role) !== "SuperAdmin") redirect("/dashboard");

    const [milestoneRows, partnerRows] = await Promise.all([
        db
            .select({
                id: corporateUnlockMilestones.id,
                milestoneType: corporateUnlockMilestones.milestoneType,
                thresholdValue: corporateUnlockMilestones.thresholdValue,
                currentValue: corporateUnlockMilestones.currentValue,
                status: corporateUnlockMilestones.status,
                partnerName: users.name,
            })
            .from(corporateUnlockMilestones)
            .leftJoin(users, eq(users.id, corporateUnlockMilestones.corporatePartnerId))
            .orderBy(desc(corporateUnlockMilestones.createdAt))
            .catch(() => []),
        db
            .select({
                id: corporatePartners.id,
                orgName: corporatePartners.orgName,
                lookerReportId: corporatePartners.lookerReportId,
                lookerShareUrl: corporatePartners.lookerShareUrl,
            })
            .from(corporatePartners)
            .orderBy(corporatePartners.orgName)
            .catch(() => []),
    ]);

    const milestones: MilestoneRow[] = milestoneRows.map((m) => ({
        id: m.id,
        milestoneType: m.milestoneType,
        thresholdValue: m.thresholdValue,
        currentValue: m.currentValue ?? 0,
        status: m.status ?? "LOCKED",
        partnerName: m.partnerName ?? "—",
    }));

    const partners: PartnerLookerRow[] = partnerRows.map((p) => ({
        id: p.id,
        orgName: p.orgName,
        lookerReportId: p.lookerReportId ?? "",
        lookerShareUrl: p.lookerShareUrl ?? "",
    }));

    return (
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-8 space-y-10">
            <section>
                <h1 className="text-display-sm text-foreground">ESG milestone unlock</h1>
                <p className="text-body-sm text-foreground-muted mt-1 mb-6">
                    Manually release corporate funds/resources tied to an impact milestone. Records an
                    auditable override in <code>corporate_unlock_triggers</code>.
                </p>
            </section>
            <EsgUnlockPanel milestones={milestones} partners={partners} />
        </div>
    );
}
