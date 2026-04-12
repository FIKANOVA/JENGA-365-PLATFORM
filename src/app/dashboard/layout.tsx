import RoleSidebar from "@/components/dashboard/RoleSidebar";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

    const userRole = (session.user as any).role as string;

    // Role-based dashboard map
    const roleDashboardMap: Record<string, string> = {
        SuperAdmin: "/dashboard/admin",
        Moderator: "/dashboard/moderator",
        Mentor: "/dashboard/mentor",
        Mentee: "/dashboard/mentee",
        CorporatePartner: "/dashboard/partner",
    };

    let correctDashboard = roleDashboardMap[userRole] || "/dashboard/mentee";
    // effectiveRole is passed to the sidebar — NGOs get "NGO" so they see NGO-specific nav
    let effectiveRole = userRole;

    // NGO partners share CorporatePartner role but own /dashboard/ngo
    if (userRole === "CorporatePartner") {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { metadata: true },
        });
        if (dbUser?.metadata?.orgType === "NGO") {
            correctDashboard = "/dashboard/ngo";
            effectiveRole = "NGO";
        }
    }

    // Use the x-pathname header set by middleware (falls back to no check if missing)
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";

    // Gate: Intake must be complete for Mentees
    const intakeCompleted = (session.user as any).intakeCompleted ?? false;
    if (userRole === "Mentee" && !intakeCompleted) {
        redirect("/onboarding/intake");
    }

    // Note: AI Interview is no longer a hard gate. It is surfaced in-dashboard
    // via the AI Interview nav link for profile enhancement and matching improvement.

    // Only enforce redirect when we have a reliable pathname AND the user is on the wrong dashboard
    // Exempt: /dashboard/settings (shared across all roles), /dashboard/[role]/studio
    const isSharedRoute = pathname.startsWith("/dashboard/settings") || pathname === "/dashboard";
    if (pathname && !isSharedRoute && !pathname.startsWith(correctDashboard)) {
        redirect(correctDashboard);
    }

    return (
        <div className="flex min-h-screen bg-muted/5">
            <RoleSidebar role={effectiveRole} />
            <div className="flex-1 flex flex-col">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
