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

    const correctDashboard = roleDashboardMap[userRole] || "/dashboard/mentee";

    // Use the x-pathname header set by middleware (falls back to no check if missing)
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "";

    // Gate 1: Intake must be complete for Mentees
    const intakeCompleted = (session.user as any).intakeCompleted ?? false;
    if (userRole === "Mentee" && !intakeCompleted) {
        redirect("/onboarding/intake");
    }

    // Gate 2: AI Interview must be complete for Mentees (embedding must exist).
    // Mentees who skip the AI Interviewer have no embedding and get zero matches.
    // Redirect them back to complete the interview.
    if (userRole === "Mentee" && intakeCompleted) {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { embedding: true },
        });
        if (!dbUser?.embedding) {
            redirect("/onboarding?reason=interview_required");
        }
    }

    // Only enforce redirect when we have a reliable pathname AND the user is on the wrong dashboard
    // Exempt: /dashboard/settings (shared across all roles), /dashboard/[role]/studio
    const isSharedRoute = pathname.startsWith("/dashboard/settings") || pathname === "/dashboard";
    if (pathname && !isSharedRoute && !pathname.startsWith(correctDashboard)) {
        redirect(correctDashboard);
    }

    return (
        <div className="flex min-h-screen bg-muted/5">
            <RoleSidebar role={userRole} />
            <div className="flex-1 flex flex-col">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
