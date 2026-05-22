import { cn } from "@/lib/utils";

type Role = "Mentee" | "Mentor" | "CorporatePartner" | "Moderator" | "SuperAdmin";

interface RoleBadgeProps {
    role: Role | string | null | undefined;
    className?: string;
}

/**
 * Color-coded role badge — Kenyan flag brand system:
 *   Mentee     → Kenya green (#006600)
 *   Mentor     → Kenya black (#1A1A1A) on neutral surface
 *   Partner    → Kenya red (#BB0000) on soft red surface
 *   Moderator  → Gold (#FFD700) on soft gold surface
 *   SuperAdmin → White on white surface with black border ring
 */
type StyleEntry = { background: string; color: string; label: string; border?: string };

const ROLE_STYLES: Record<Role, StyleEntry> = {
    Mentee: {
        background: "var(--brand-green-soft)",
        color: "var(--brand-green)",
        label: "Mentee",
    },
    Mentor: {
        background: "var(--surface-2)",
        color: "var(--brand-black)",
        label: "Mentor",
    },
    CorporatePartner: {
        background: "var(--brand-red-soft)",
        color: "var(--brand-red)",
        label: "Partner",
    },
    Moderator: {
        background: "#FFF8DB",
        color: "#7A5A00",
        label: "Moderator",
    },
    SuperAdmin: {
        background: "#FFFFFF",
        color: "var(--brand-black)",
        label: "Admin",
        border: "1px solid var(--brand-black)",
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
            style={{
                background: style.background,
                color: style.color,
                letterSpacing: "0.02em",
                border: style.border,
            }}
        >
            {style.label}
        </span>
    );
}
