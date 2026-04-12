import { auth } from "@/lib/auth/config";
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

    const target = ROLE_REDIRECTS[user.role] ?? "/dashboard/mentee";
    redirect(target);
}
