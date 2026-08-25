import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NgoMouForm from "@/components/dashboard/NGO/NgoMouForm";

import { normalizeRole } from "@/lib/auth/roles";

export const metadata: Metadata = {
    title: "Resource Exchange MOU | Jenga365",
    description: "Sign your Resource Exchange Memorandum of Understanding with Jenga365.",
};

export default async function NgoMouPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");

    const user = session.user as any;
    const role = normalizeRole(user.role);

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { metadata: true, partnerId: true },
    }).catch(() => null);

    // Guard: only NGO partners may access this page
    if (role !== "NGO" && dbUser?.metadata?.orgType !== "NGO" && role !== "SuperAdmin") {
        redirect("/dashboard");
    }

    // partnerId is required to create an MOU record
    const partnerId = dbUser?.partnerId ?? null;

    return <NgoMouForm partnerCorporateId={partnerId} orgName={user.name ?? "Your Organisation"} />;
}
