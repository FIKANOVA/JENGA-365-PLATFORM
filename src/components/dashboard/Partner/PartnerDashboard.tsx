"use client";

import { ChevronRight, MapPin, Plus, BarChart3 } from "lucide-react";
import { BentoCard, MetricTile } from "@/components/dashboard/shared/BentoCard";

interface CsrStats {
  menteesSponsored: number;
  activeMentorships: number;
  donationsTotal: number;
  projectsFunded: number;
}

interface MentorUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface EventRow {
  id: string;
  title: string;
  date: Date;
  location: string | null;
  isOnline: boolean | null;
  type: string;
}

interface PartnerDashboardProps {
  company?: string;
  tier?: string | null;
  csrStats?: CsrStats | null;
  mentors?: MentorUser[];
  upcomingEvents?: EventRow[];
}

export default function PartnerDashboard({
  company = "Your Organisation",
  tier = "Partner",
  csrStats = null,
  mentors = [],
  upcomingEvents = [],
}: PartnerDashboardProps) {
  const metrics = [
    {
      label: "Mentees sponsored",
      value: csrStats ? String(csrStats.menteesSponsored) : "—",
      change: csrStats ? "Live data" : "No partner linked",
    },
    {
      label: "Active mentorships",
      value: csrStats ? String(csrStats.activeMentorships) : "—",
      change: csrStats ? "Live data" : "No partner linked",
    },
    {
      label: "Total donations",
      value: csrStats ? `KES ${csrStats.donationsTotal.toLocaleString()}` : "—",
      change: csrStats ? "Live data" : "No partner linked",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-6 lg:py-8 flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-6">
        <div className="space-y-1">
          <p className="text-eyebrow text-foreground-muted">{company}</p>
          <h2 className="text-display-sm text-foreground">Impact portal</h2>
        </div>
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-eyebrow self-start sm:self-auto"
          style={{
            background: "var(--brand-green-soft)",
            color: "var(--brand-green)",
          }}
        >
          {tier ?? "Partner"} tier
        </div>
      </header>

      {/* Impact metrics — bento tiles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
        {metrics.map((metric, i) => (
          <MetricTile
            key={metric.label}
            label={metric.label}
            value={metric.value}
            change={metric.change}
            trend={csrStats ? "up" : "neutral"}
            index={i}
          />
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Sponsored mentors */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-headline text-foreground">
              Your mentors ({mentors.length})
            </h3>
            <button
              className="inline-flex items-center min-h-11 rounded-md text-label hover:underline focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]"
              style={{ color: "var(--brand-green)" }}
            >
              View all
            </button>
          </div>

          {mentors.length === 0 ? (
            <BentoCard className="border-dashed p-6 text-center text-body-sm text-foreground-muted">
              No mentors linked to this partner yet.
            </BentoCard>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex flex-col items-center min-w-[72px]"
                >
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-label font-medium mb-2"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    {(mentor.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-body-sm text-foreground text-center truncate w-full">
                    {mentor.name ?? "—"}
                  </span>
                </div>
              ))}
              <button className="flex flex-col items-center min-w-[72px] rounded-md focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-ring)]">
                <div className="h-12 w-12 rounded-full border border-dashed border-border flex items-center justify-center mb-2 text-foreground-muted hover:text-foreground hover:border-border transition-colors">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-body-sm text-foreground-muted">
                  Invite
                </span>
              </button>
            </div>
          )}
        </section>

        {/* Upcoming events */}
        <section>
          <h3 className="text-headline text-foreground mb-4">
            Upcoming partner events
          </h3>
          {upcomingEvents.length === 0 ? (
            <BentoCard className="border-dashed p-6 text-center text-body-sm text-foreground-muted">
              No upcoming events.
            </BentoCard>
          ) : (
            <div className="flex flex-col gap-3">
              {upcomingEvents.map((evt) => {
                const d = new Date(evt.date);
                return (
                  <div
                    key={evt.id}
                    className="flex items-center gap-4 rounded-md border border-border bg-background p-3 hover:bg-[color:var(--surface-2)] transition-colors group cursor-pointer"
                  >
                    <div
                      className="flex flex-col items-center justify-center h-12 w-12 rounded-md shrink-0"
                      style={{
                        background: "var(--surface-2)",
                      }}
                    >
                      <span className="text-eyebrow text-foreground-muted">
                        {d.toLocaleString("en", { month: "short" })}
                      </span>
                      <span className="text-title text-foreground leading-none">
                        {d.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-body text-foreground font-medium truncate">
                        {evt.title}
                      </h4>
                      <p className="mt-0.5 flex items-center gap-1 text-body-sm text-foreground-muted">
                        <MapPin className="h-3 w-3" />
                        {evt.isOnline ? "Online" : (evt.location ?? "TBD")}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Reporting pointer — canonical reporting is the Looker Studio embed above per CLAUDE.md §10.5/§11 */}
      <BentoCard className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
            style={{ background: "var(--background)" }}
          >
            <BarChart3
              className="h-5 w-5"
              style={{ color: "var(--brand-green)" }}
            />
          </span>
          <div className="space-y-1">
            <h3 className="text-title text-foreground">
              ESG reports live in Looker Studio
            </h3>
            <p className="text-body-sm text-foreground-muted max-w-md">
              Use the embedded dashboard above for live metrics, or copy the
              share link to forward reports to your board.
            </p>
          </div>
        </div>
      </BentoCard>
    </div>
  );
}
