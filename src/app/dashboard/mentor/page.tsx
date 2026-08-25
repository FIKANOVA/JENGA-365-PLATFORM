import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import MentorDashboard from "@/components/dashboard/Mentor/MentorDashboard";
import {
    getMentorPendingRequests,
    getMentorActiveMentees,
    getMentorUpcomingSessions,
} from "@/lib/db/queries/dashboard";

import { redirect } from "next/navigation";

import { normalizeRole } from "@/lib/auth/roles";

export const metadata: Metadata = {
    title: "Mentor Dashboard | Jenga365",
    description: "Welcome to your Jenga365 Mentor Dashboard.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MentorDashboardPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");
    const role = normalizeRole((session.user as any)?.role);
    if (role !== "Mentor" && role !== "SuperAdmin") {
        redirect("/dashboard");
    }
    const userId = session.user.id;

    const [pendingRequests, activeMentees, upcomingSessions] = await Promise.all([
        userId ? getMentorPendingRequests(userId).catch(() => []) : [],
        userId ? getMentorActiveMentees(userId).catch(() => []) : [],
        userId ? getMentorUpcomingSessions(userId).catch(() => []) : [],
    ]);

    const userName = session?.user?.name ?? "Mentor";

    return (
        <MentorDashboard
            userName={userName}
            pendingRequests={pendingRequests}
            activeMenteeCount={activeMentees.length}
            upcomingSessions={upcomingSessions}
        />
    );
}
