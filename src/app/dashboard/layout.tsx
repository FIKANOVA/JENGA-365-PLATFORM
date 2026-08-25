import RoleSidebar from "@/components/dashboard/RoleSidebar";
import DashboardHeader from "@/components/dashboard/shared/DashboardHeader";
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

    // Query live DB status to avoid stale 5-minute session cookieCache
    let dbUser = null;
    try {
        dbUser = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { intakeCompleted: true, onboarded: true },
        });
    } catch (err) {
        console.error("[DashboardLayout] Live DB lookup failed, falling back to session data:", err);
    }

    // Gate: Intake must be complete for Mentees
    const intakeCompleted = dbUser?.intakeCompleted ?? sessionUser.intakeCompleted ?? false;
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
        <div className="flex h-screen overflow-hidden bg-muted/5">
            <RoleSidebar role={effectiveRole} />
            <div className="flex-1 flex flex-col min-w-0 h-screen">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto min-h-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
