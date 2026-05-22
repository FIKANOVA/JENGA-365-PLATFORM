import { cn } from "@/lib/utils";

type Role = "Mentee" | "Mentor" | "CorporatePartner" | "Moderator" | "SuperAdmin";

interface RoleBadgeProps {
    role: Role | string | null | undefined;
    className?: string;
}

/**
 * Color-coded role badge per Moseti spec:
 *   Mentee     → Kenya green
 *   Mentor     → Kenya red
 *   Partner    → slate (corporate neutral)
 *   Moderator  → gold/amber
 *   SuperAdmin → black
 */
const ROLE_STYLES: Record<Role, { background: string; color: string; label: string }> = {
    Mentee: {
        background: "var(--brand-green-soft)",
        color: "var(--brand-green)",
        label: "Mentee",
    },
    Mentor: {
        background: "var(--brand-red-soft)",
        color: "var(--brand-red)",
        label: "Mentor",
    },
    CorporatePartner: {
        background: "var(--surface-2)",
        color: "var(--foreground)",
        label: "Partner",
    },
    Moderator: {
        background: "#FEF3C7",
        color: "#92400E",
        label: "Moderator",
    },
    SuperAdmin: {
        background: "var(--brand-black)",
        color: "#FFFFFF",
        label: "Admin",
    },
};

export default function RoleBadge({ role, className }: RoleBadgeProps) {
    if (!role || !(role in ROLE_STYLES)) return null;
    const style = ROLE_STYLES[role as Role];
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                className,
            )}
            style={{ background: style.background, color: style.color, letterSpacing: "0.02em" }}
        >
            {style.label}
        </span>
    );
}
