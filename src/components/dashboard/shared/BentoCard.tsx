import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Premium dashboard surface primitive (DESIGN.md §"Dashboard bento patterns").
 * Soft off-white surface, hairline border, atmospheric shadow — no heavy borders.
 * - `interactive` adds the hover lift on clickable tiles.
 * - `accentColor` (a CSS color, usually a role/brand token) draws the top accent rule.
 * - `index` opts the tile into a reduced-motion-aware entrance with a staggered delay.
 */
type BentoCardProps = React.ComponentProps<"div"> & {
  accentColor?: string;
  interactive?: boolean;
  index?: number;
};

export function BentoCard({
  className,
  accentColor,
  interactive,
  index,
  style,
  children,
  ...props
}: BentoCardProps) {
  const entrance = typeof index === "number";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/70 bg-[color:var(--surface-1)] shadow-[var(--shadow-sm)]",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-[var(--shadow)]",
        entrance &&
          "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-safe:fill-mode-backwards",
        className,
      )}
      style={entrance ? { animationDelay: `${index * 50}ms`, ...style } : style}
      {...props}
    >
      {accentColor && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ background: accentColor }}
        />
      )}
      {children}
    </div>
  );
}

/** Role → accent color, mapped to the locked brand tokens (Moderator = new gold). */
export const ROLE_ACCENT: Record<string, string> = {
  Mentee: "var(--brand-green)",
  Mentor: "var(--brand-black)",
  CorporatePartner: "var(--brand-red)",
  NGO: "var(--brand-red)",
  Moderator: "var(--brand-gold-strong)",
  SuperAdmin: "var(--foreground)",
};

export type MetricTrend = "up" | "down" | "neutral";

const TREND_META: Record<
  MetricTrend,
  { color: string; Icon: typeof TrendingUp }
> = {
  up: { color: "var(--brand-green)", Icon: TrendingUp },
  down: { color: "var(--brand-red)", Icon: TrendingDown },
  neutral: { color: "var(--foreground-muted)", Icon: Minus },
};

/**
 * Metric tile for bento stat grids. `featured` enlarges the value for the lead
 * metric (display-md → display-lg on wide screens). Hierarchy is weight/scale-led,
 * numbers are tabular for column alignment.
 */
export function MetricTile({
  label,
  value,
  trend = "neutral",
  change,
  featured = false,
  index,
  className,
}: {
  label: string;
  value: string;
  trend?: MetricTrend;
  change?: string;
  featured?: boolean;
  index?: number;
  className?: string;
}) {
  const { color, Icon } = TREND_META[trend];
  return (
    <BentoCard
      accentColor={color}
      index={index}
      className={cn(
        "flex flex-col justify-between gap-3 p-6",
        featured && "lg:p-8",
        className,
      )}
    >
      <span className="text-eyebrow text-foreground-muted">{label}</span>
      <span
        className={cn(
          "font-semibold tabular-nums tracking-tight text-foreground",
          featured ? "text-display-md lg:text-display-lg" : "text-display-sm",
        )}
      >
        {value}
      </span>
      {change ? (
        <span
          className="inline-flex items-center gap-1 text-body-sm"
          style={{ color }}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {change}
        </span>
      ) : (
        <span className="h-4" aria-hidden />
      )}
    </BentoCard>
  );
}
