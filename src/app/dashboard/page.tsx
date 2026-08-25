import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeRole } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ROLE_REDIRECTS: Record<string, string> = {
    Mentee: "/dashboard/mentee",
    Mentor: "/dashboard/mentor",
    CorporatePartner: "/dashboard/partner",
    NGO: "/dashboard/ngo",
    Moderator: "/dashboard/moderator",
    SuperAdmin: "/dashboard/admin",
};

export default async function DashboardRootPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }

    if (!session?.user) redirect("/login");

    const user = session.user as { id: string; role?: string };
    let role = normalizeRole(user.role);

    if (role === "CorporatePartner") {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
            columns: { role: true, metadata: true },
        }).catch(() => null);

        const meta = dbUser?.metadata as Record<string, unknown> | undefined;
        if (dbUser?.role === "NGO" || meta?.orgType === "NGO") {
            role = "NGO";
        }
    }

    redirect(ROLE_REDIRECTS[role] ?? "/dashboard/mentee");
}
