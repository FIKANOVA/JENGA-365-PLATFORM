import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import MentorDashboard from "@/components/dashboard/Mentor/MentorDashboard";
import {
    getMentorPendingRequests,
    getMentorActiveMentees,
    getMentorUpcomingSessions,
} from "@/lib/db/queries/dashboard";

export const metadata: Metadata = {
    title: "Mentor Dashboard | Jenga365",
    description: "Welcome to your Jenga365 Mentor Dashboard.",
};

export default async function MentorDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

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
