import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getNgoMouStatus, getNgoExchangeLog } from "@/lib/actions/ngoWorkflow";
import { db } from "@/lib/db";
import { corporatePartners, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NgoDashboard from "@/components/dashboard/NGO/NgoDashboard";

export const metadata: Metadata = {
    title: "NGO Resource Exchange Portal | Jenga365",
    description: "Track your Resource Exchange contributions and volunteer workforce mobilised through Jenga365.",
};

export default async function NgoDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    const user = session.user as any;

    // Guard: only NGO org type may access this dashboard
    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { metadata: true, partnerId: true },
    });

    if (dbUser?.metadata?.orgType !== "NGO") {
        redirect("/dashboard/partner");
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

    // If MOU not yet signed, send to MOU signing page
    if (!mouStatus?.signed) {
        redirect("/dashboard/ngo/mou");
    }

    return (
        <NgoDashboard
            orgName={partner?.orgName ?? user.name ?? "Your Organisation"}
            mouStatus={mouStatus}
            exchangeLog={exchangeLog}
        />
    );
}
