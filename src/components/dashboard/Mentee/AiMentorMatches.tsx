"use client";

import { Sparkles, MapPin } from "lucide-react";
import { BentoCard } from "@/components/dashboard/shared/BentoCard";

interface MentorMatch {
  id: string;
  name: string | null;
  locationRegion: string | null;
  matchPercentage: number;
  insights: {
    profileMatch: number;
    deepSkillMatch?: number;
    goalAlignment?: number;
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
        featured ? "md:col-span-2 flex flex-col p-6" : "flex flex-col p-5"
      }
    >
      {featured && (
        <span
          className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[color:var(--brand-green-soft)] px-2.5 py-1 text-eyebrow font-semibold"
          style={{ color: "var(--brand-green)" }}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Top match
        </span>
      )}
      <div
        className={
          featured
            ? "flex items-start justify-between gap-4 mt-3"
            : "flex items-start justify-between gap-3"
        }
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`${featured ? "h-14 w-14 text-xl" : "h-12 w-12 text-lg"} rounded-full flex items-center justify-center font-semibold border border-border shrink-0 text-foreground-muted`}
            style={{ background: "var(--surface-2)" }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <h4
              className={`${featured ? "text-display-sm" : "text-headline"} text-foreground truncate`}
            >
              {mentor.name ?? "Mentor"}
            </h4>
            <p className="text-body-sm text-foreground-muted flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {mentor.locationRegion ?? "Location not set"}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className={`${featured ? "text-display-sm" : "text-headline"} font-semibold tabular-nums leading-none`}
            style={{ color: "var(--brand-green)" }}
          >
            {mentor.matchPercentage}%
          </div>
          <div className="text-eyebrow text-foreground-muted mt-1">match</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/70">
        <InsightChip label="Profile" value={mentor.insights.profileMatch} />
        {mentor.insights.deepSkillMatch !== undefined && (
          <InsightChip label="Skills" value={mentor.insights.deepSkillMatch} />
        )}
        {mentor.insights.goalAlignment !== undefined && (
          <InsightChip label="Goal" value={mentor.insights.goalAlignment} />
        )}
      </div>
    </BentoCard>
  );
}

export default function AiMentorMatches({
  matches = [],
}: AiMentorMatchesProps) {
  return (
    <section>
      <h3 className="text-headline text-foreground mb-4">AI mentor matches</h3>

      {matches.length === 0 ? (
        <BentoCard className="border-dashed p-8 text-center text-body-sm text-foreground-muted">
          Complete your AI interview to see personalised mentor matches.
        </BentoCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {matches.map((mentor, i) => (
            <MatchTile key={mentor.id} mentor={mentor} featured={i === 0} />
          ))}
        </div>
      )}
    </section>
  );
}
