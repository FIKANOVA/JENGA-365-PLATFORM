"use client";

import { Lightbulb, ArrowRight } from "lucide-react";
import MentorshipQueue from "./MentorshipQueue";
import UpcomingSessions from "./UpcomingSessions";
import { MetricTile } from "@/components/dashboard/shared/BentoCard";

interface PendingRequest {
  pairId: string;
  matchedAt: Date;
  matchScore: string | null;
  mentee: {
    id: string;
    name: string | null;
    image: string | null;
    locationRegion: string | null;
  } | null;
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
    { label: "Pending requests", value: String(pendingRequests.length) },
    { label: "Active mentees", value: String(activeMenteeCount) },
    { label: "Sessions this month", value: String(upcomingSessions.length) },
    { label: "Profile status", value: "Active" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-6 lg:py-8 flex flex-col gap-8">
      <header className="border-b border-border pb-6 space-y-1">
        <p className="text-eyebrow text-foreground-muted">Mentor overview</p>
        <h2 className="text-display-sm text-foreground">
          Good morning, {userName.split(" ")[0]}
        </h2>
        <p className="text-body-sm text-foreground-muted">
          Here&apos;s your mentor overview for today.
        </p>
      </header>

      {/* Stats — bento metric grid; lead metric featured */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-fr">
        {stats.map((stat, i) => (
          <MetricTile
            key={stat.label}
            label={stat.label}
            value={stat.value}
            index={i}
            featured={i === 0}
            className={i === 0 ? "col-span-2 lg:row-span-2" : ""}
          />
        ))}
      </section>

      {/* AI insight */}
      <section
        className="rounded-md border border-border p-5 flex gap-4 items-start"
        style={{ background: "var(--brand-green-soft)" }}
      >
        <span
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          style={{ background: "var(--background)" }}
        >
          <Lightbulb
            className="h-5 w-5"
            style={{ color: "var(--brand-green)" }}
          />
        </span>
        <div className="flex-1 space-y-1.5">
          <h3 className="text-title text-foreground">
            AI intervention recommendation
          </h3>
          <p className="text-body-sm text-foreground-muted">
            {pendingRequests.length > 0
              ? `You have ${pendingRequests.length} pending mentee request${pendingRequests.length > 1 ? "s" : ""} awaiting your review.`
              : "Your mentee queue is clear. Consider updating your profile to attract new matches."}
          </p>
          <button
            className="inline-flex items-center gap-1.5 min-h-11 rounded-md text-label font-medium hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
            style={{ color: "var(--brand-green)" }}
          >
            Review queue <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <MentorshipQueue pendingRequests={pendingRequests} />
        </div>
        <UpcomingSessions sessions={upcomingSessions} />
      </div>
    </div>
  );
}
