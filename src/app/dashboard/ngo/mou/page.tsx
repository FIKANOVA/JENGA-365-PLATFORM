import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NgoMouForm from "@/components/dashboard/NGO/NgoMouForm";

export const metadata: Metadata = {
    title: "Resource Exchange MOU | Jenga365",
    description: "Sign your Resource Exchange Memorandum of Understanding with Jenga365.",
};

export default async function NgoMouPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    const user = session.user as any;

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { metadata: true, partnerId: true },
    });

    // Guard: only NGO partners may access this page
    if (dbUser?.metadata?.orgType !== "NGO") {
        redirect("/dashboard/partner");
    }

    // partnerId is required to create an MOU record
    const partnerId = dbUser?.partnerId ?? null;

    return <NgoMouForm partnerCorporateId={partnerId} orgName={user.name ?? "Your Organisation"} />;
}
