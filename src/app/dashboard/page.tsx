import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ROLE_REDIRECTS: Record<string, string> = {
    Mentee: "/dashboard/mentee",
    Mentor: "/dashboard/mentor",
    CorporatePartner: "/dashboard/partner",
    Moderator: "/dashboard/moderator",
    SuperAdmin: "/dashboard/admin",
};

export default async function DashboardRootPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) redirect("/login");

    const user = session.user as any;

    if (!user.ndaSigned) redirect("/legal/nda");

    let target = ROLE_REDIRECTS[user.role] ?? "/dashboard/mentee";

    // NGO partners share the CorporatePartner role but get their own dashboard
    if (user.role === "CorporatePartner") {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
            columns: { metadata: true },
        });
        if (dbUser?.metadata?.orgType === "NGO") {
            target = "/dashboard/ngo";
        }
    }

    redirect(target);
}
