"use client";

import { Lightbulb, ArrowRight } from "lucide-react";
import MentorshipQueue from "./MentorshipQueue";
import UpcomingSessions from "./UpcomingSessions";

interface PendingRequest {
    pairId: string;
    matchedAt: Date;
    matchScore: string | null;
    mentee: { id: string; name: string | null; image: string | null; locationRegion: string | null } | null;
}

interface UpcomingSession {
    id: string;
    pairId: string;
    sessionDate: Date;
    durationMinutes: number;
    notes: string | null;
    menteeName?: string;
}

interface MentorDashboardProps {
    userName?: string;
    pendingRequests?: PendingRequest[];
    activeMenteeCount?: number;
    upcomingSessions?: UpcomingSession[];
}

export default function MentorDashboard({
    userName = "Mentor",
    pendingRequests = [],
    activeMenteeCount = 0,
    upcomingSessions = [],
}: MentorDashboardProps) {
    const stats = [
        { label: "Pending Requests", value: String(pendingRequests.length) },
        { label: "Active Mentees", value: String(activeMenteeCount) },
        { label: "Sessions This Month", value: String(upcomingSessions.length) },
        { label: "Profile Status", value: "Active" },
    ];

    return (
        <div className="flex-1 p-6 sm:p-10 flex flex-col gap-8 text-foreground bg-background h-full overflow-y-auto">
            <div className="flex flex-col">
                <h2 className="font-playfair text-[24px] font-bold leading-tight">
                    Good morning, {userName.split(" ")[0]}
                </h2>
                <p className="text-muted-foreground text-sm font-normal">
                    Here is your mentor overview for today.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-2 rounded-lg border border-border/50 p-6 bg-card shadow-sm hover:shadow transition-shadow"
                    >
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                            {stat.label}
                        </p>
                        <p className="font-playfair text-[28px] font-black leading-none">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* AI Insights Panel */}
            <div className="rounded-lg border border-primary bg-kenya-red/5 p-5 flex gap-4 items-start shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <Lightbulb className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                    <h3 className="font-playfair text-foreground text-lg font-bold">
                        AI Intervention Recommendation
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed font-sans mt-1">
                        {pendingRequests.length > 0
                            ? `You have ${pendingRequests.length} pending mentee request${pendingRequests.length > 1 ? "s" : ""} awaiting your review.`
                            : "Your mentee queue is clear. Consider updating your profile to attract new matches."}
                    </p>
                    <button className="mt-2 text-primary text-sm font-bold flex items-center gap-1 hover:underline w-fit outline-none focus:ring-1 focus:ring-primary rounded-sm">
                        Review queue <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 flex flex-col gap-6">
                    <MentorshipQueue pendingRequests={pendingRequests} />
                </div>
                <UpcomingSessions sessions={upcomingSessions} />
            </div>
        </div>
    );
}
