"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import { BentoCard } from "@/components/dashboard/shared/BentoCard";

interface MentorMatch {
  id: string;
  name: string | null;
  image?: string | null;
  title?: string;
  locationRegion: string | null;
  matchPercentage: number;
  insights: {
    profileMatch: number;
    deepSkillMatch?: number;
    goalAlignment?: number;
    reason?: string;
  };
}

interface AiMentorMatchesProps {
  matches?: MentorMatch[];
}

function InsightChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-[color:var(--surface-2)] px-2.5 py-1 text-eyebrow text-foreground-muted">
      {label}
      <span className="font-semibold tabular-nums text-foreground">
        {value}%
      </span>
    </span>
  );
}

function MatchTile({
  mentor,
  featured = false,
}: {
  mentor: MentorMatch;
  featured?: boolean;
}) {
  const initial = (mentor.name ?? "?").charAt(0).toUpperCase();

  return (
    <BentoCard
      interactive
      accentColor="var(--brand-green)"
      className={
        featured ? "md:col-span-2 flex flex-col p-6 space-y-4" : "flex flex-col p-5 space-y-4"
      }
    >
      <div className="flex items-center justify-between gap-2">
        {featured ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand-green-soft)] px-2.5 py-0.5 text-eyebrow font-semibold"
            style={{ color: "var(--brand-green)" }}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Top Match
          </span>
        ) : (
          <span className="text-eyebrow text-foreground-muted uppercase font-semibold tracking-wider">
            {mentor.title || "Mentor"}
          </span>
        )}

        <div className="flex items-baseline gap-1 text-right shrink-0">
          <span
            className="text-display-xs font-bold tabular-nums"
            style={{ color: "var(--brand-green)" }}
          >
            {mentor.matchPercentage}%
          </span>
          <span className="text-eyebrow text-foreground-muted">match</span>
        </div>
      </div>

      <div className="flex items-start gap-3.5 min-w-0">
        <div
          className={`${featured ? "h-14 w-14 text-xl" : "h-12 w-12 text-lg"} rounded-full flex items-center justify-center font-semibold border border-border shrink-0 overflow-hidden relative shadow-xs`}
          style={{ background: "var(--surface-2)" }}
        >
          {mentor.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={mentor.image}
              alt={mentor.name || "Mentor"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-foreground-muted select-none">{initial}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4
            className={`${featured ? "text-headline" : "text-label"} text-foreground font-semibold truncate`}
          >
            {mentor.name ?? "Mentor"}
          </h4>
          {featured && mentor.title && (
            <p className="text-body-sm text-foreground-muted truncate">
              {mentor.title}
            </p>
          )}
          <p className="text-xs text-foreground-subtle flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            {mentor.locationRegion ?? "Global"}
          </p>
        </div>
      </div>

      {/* AI Match Reason Banner */}
      {mentor.insights?.reason && (
        <div
          className="rounded-md px-3 py-2 text-xs border"
          style={{
            background: "var(--brand-green-soft)",
            borderColor: "rgba(0, 192, 95, 0.2)",
            color: "var(--foreground)",
          }}
        >
          <p className="line-clamp-2">
            <span className="font-semibold text-[var(--brand-green)] mr-1.5">
              Why matched:
            </span>
            {mentor.insights.reason}
          </p>
        </div>
      )}

      {/* Breakdown Scores */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/70 mt-auto">
        <InsightChip label="Profile" value={mentor.insights.profileMatch} />
        {mentor.insights.goalAlignment !== undefined && (
          <InsightChip label="Goals" value={mentor.insights.goalAlignment} />
        )}
        <Link
          href={`/mentors/${mentor.id}`}
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold hover:underline"
          style={{ color: "var(--brand-green)" }}
        >
          View profile <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </BentoCard>
  );
}

export default function AiMentorMatches({
  matches = [],
}: AiMentorMatchesProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-headline text-foreground">AI Mentor Recommendations</h3>
        <span className="text-xs text-foreground-muted">
          Updated dynamically via Jenga AI
        </span>
      </div>

      {matches.length === 0 ? (
        <BentoCard className="border-dashed p-8 text-center text-body-sm text-foreground-muted space-y-2">
          <Sparkles className="w-6 h-6 mx-auto text-[var(--brand-green)]" />
          <p className="font-semibold text-foreground">No matches generated yet</p>
          <p>
            Complete your diagnostic intake or AI interview to see personalised mentor matches tailored to your goals.
          </p>
        </BentoCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
          {matches.map((mentor, i) => (
            <MatchTile key={mentor.id} mentor={mentor} featured={i === 0} />
          ))}
        </div>
      )}
    </section>
  );
}
