import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const ROLE_REDIRECTS: Record<string, string> = {
    Mentee: "/dashboard/mentee",
    Mentor: "/dashboard/mentor",
    CorporatePartner: "/dashboard/partner",
    NGO: "/dashboard/ngo",
    Moderator: "/dashboard/moderator",
    SuperAdmin: "/dashboard/admin",
};

export default async function DashboardRootPage() {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) redirect("/login");

    const user = session.user as { role?: string; ndaSigned?: boolean };
    const role = user.role ?? "Mentee";

    // Org partners (corporate + NGO) sign an NDA at registration; gate until signed.
    if ((role === "CorporatePartner" || role === "NGO") && !user.ndaSigned) {
        redirect("/legal/nda");
    }

    redirect(ROLE_REDIRECTS[role] ?? "/dashboard/mentee");
}
