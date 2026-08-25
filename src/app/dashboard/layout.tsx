import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const sessionUser = session.user as {
        id: string;
        role?: string;
        intakeCompleted?: boolean;
    };
    const userRole = sessionUser.role ?? "Mentee";
    const effectiveRole = userRole;

    // Role-based dashboard map
    const roleDashboardMap: Record<string, string> = {
        SuperAdmin: "/dashboard/admin",
        Moderator: "/dashboard/moderator",
        Mentor: "/dashboard/mentor",
        Mentee: "/dashboard/mentee",
        CorporatePartner: "/dashboard/partner",
        NGO: "/dashboard/ngo",
    };

    const correctDashboard = roleDashboardMap[effectiveRole] || "/dashboard/mentee";

    // Use the x-pathname header set by middleware (falls back to no check if missing)
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";

    // Only enforce redirect when a user tries to access a different role's root dashboard
    const otherRoleDashboards = Object.values(roleDashboardMap).filter((d) => d !== correctDashboard);
    const isAccessingOtherRole = otherRoleDashboards.some((d) => pathname.startsWith(d));
    if (pathname && isAccessingOtherRole) {
        redirect(correctDashboard);
    }

    return (
        <DashboardShell role={effectiveRole}>
            {children}
        </DashboardShell>
    );
}
