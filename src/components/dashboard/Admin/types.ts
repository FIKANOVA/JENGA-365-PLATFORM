export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  isApproved: boolean;
  image?: string | null;
  locationRegion?: string | null;
  metadata?: Record<string, unknown> | null;
  moderationScope?: string | null;
  ndaSigned?: boolean | null;
  ndaSignedAt?: Date | null;
  emailVerified?: boolean | null;
  rejectionReason?: string | null;
  createdAt: Date;
}

export interface StatItem {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  change: string;
}

export interface AdminDashboardProps {
  users?: UserRow[];
  stats?: StatItem[];
  currentUserId: string;
}

export const DEFAULT_STATS: StatItem[] = [
  { label: "Total users", value: "—", trend: "neutral", change: "" },
  { label: "Pending approval", value: "—", trend: "neutral", change: "" },
  { label: "Active mentors", value: "—", trend: "up", change: "" },
  { label: "Active mentees", value: "—", trend: "up", change: "" },
];

// NGO is a first-class role. Legacy NGO accounts (pre-migration 0018) may still carry the
// CorporatePartner role with metadata.orgType === "NGO" — isNgo() catches both.
export const ROLE_FILTERS: { value: string; label: string }[] = [
  { value: "All Roles", label: "All Roles" },
  { value: "SuperAdmin", label: "SuperAdmin" },
  { value: "Moderator", label: "Moderator" },
  { value: "CorporatePartner", label: "Corporate Partner" },
  { value: "NGO", label: "NGO Partner" },
  { value: "Mentor", label: "Mentor" },
  { value: "Mentee", label: "Mentee" },
];

export const isNgo = (u: UserRow) =>
  u.role === "NGO" ||
  (u.role === "CorporatePartner" &&
    String(
      (u.metadata as Record<string, unknown> | null)?.orgType ?? "",
    ).toUpperCase() === "NGO");

export const SCOPE_OPTIONS = [
  { value: "E", label: "Tier 1 — Senior Moderator (Full Access)" },
  { value: "A", label: "Tier 2 — Approvals Moderator (User Approvals)" },
  { value: "B", label: "Tier 3 — Content Moderator (Articles)" },
  { value: "C", label: "Tier 4 — Events & Community" },
  { value: "D", label: "Tier 4b — Community Manager" },
];

export const INPUT_CLASS =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-body-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-[color:var(--border-strong,#D4D4D8)] focus:ring-2 focus:ring-[color:var(--brand-green-soft)]";
