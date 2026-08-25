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

function normalizeRole(r?: string | null): string {
    if (!r) return "Mentee";
    const lower = r.toLowerCase().replace(/[-_]/g, "");
    if (lower === "superadmin" || lower === "admin") return "SuperAdmin";
    if (lower === "moderator") return "Moderator";
    if (lower === "mentor") return "Mentor";
    if (lower === "corporatepartner" || lower === "partner" || lower === "corporate") return "CorporatePartner";
    if (lower === "ngo") return "NGO";
    return "Mentee";
}

export default async function DashboardRootPage() {
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);

    if (!session) redirect("/login");

    const user = session.user as { role?: string; ndaSigned?: boolean };
    const role = normalizeRole(user.role);

    redirect(ROLE_REDIRECTS[role] ?? "/dashboard/mentee");
}
