import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getNgoMouStatus, getNgoExchangeLog } from "@/lib/actions/ngoWorkflow";
import { db } from "@/lib/db";
import { corporatePartners, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { normalizeRole } from "@/lib/auth/roles";
import NgoDashboard from "@/components/dashboard/NGO/NgoDashboard";

export const metadata: Metadata = {
    title: "NGO Resource Exchange Portal | Jenga365",
    description: "Track your Resource Exchange contributions and volunteer workforce mobilised through Jenga365.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NgoDashboardPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");

    const user = session.user as any;
    const role = normalizeRole(user.role);

    // Guard: only NGO org type may access this dashboard
    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { metadata: true, partnerId: true },
    }).catch(() => null);

    const userMetadata = dbUser?.metadata as Record<string, unknown> | undefined;
    if (role !== "NGO" && userMetadata?.orgType !== "NGO" && role !== "SuperAdmin") {
        redirect("/dashboard");
    }

    const [mouStatus, exchangeLog, partner] = await Promise.all([
        getNgoMouStatus(),
        getNgoExchangeLog(),
        dbUser?.partnerId
            ? db.query.corporatePartners.findFirst({
                where: eq(corporatePartners.id, dbUser.partnerId),
              }).catch(() => null)
            : Promise.resolve(null),
    ]);

    const sanitizedMouStatus = mouStatus
        ? {
              signed: Boolean(mouStatus.signed),
              signedAt: mouStatus.signedAt ? new Date(mouStatus.signedAt).toISOString() : null,
              resourceTypes: Array.isArray(mouStatus.resourceTypes) ? mouStatus.resourceTypes : null,
              expiresAt: mouStatus.expiresAt ? new Date(mouStatus.expiresAt).toISOString() : null,
          }
        : null;

    const sanitizedLog = (exchangeLog || []).map((e: any) => ({
        id: String(e.id || Math.random()),
        resourceType: String(e.resourceType || "Resource"),
        quantity: e.quantity != null ? Number(e.quantity) : null,
        notes: e.notes ? String(e.notes) : null,
        exchangedAt: e.exchangedAt ? new Date(e.exchangedAt).toISOString() : null,
    }));

    return (
        <NgoDashboard
            orgName={partner?.orgName ?? user.name ?? "Your Organisation"}
            mouStatus={sanitizedMouStatus as any}
            exchangeLog={sanitizedLog as any}
        />
    );
}
