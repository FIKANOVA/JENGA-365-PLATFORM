import { effectiveScopes, type Role } from "@/lib/auth/roles";

export type HelpAudience =
    | "guest"
    | "mentee"
    | "mentor"
    | "corporate"
    | "ngo"
    | "content"
    | "all";

export type HelpSessionContext = {
    role?: Role | null;
    moderationScope?: string | null;
};

/**
 * Decide whether the given session can view a help doc tagged with `allowedRoles`.
 *
 * Token semantics:
 *   guest      — no authenticated session
 *   mentee     — users.role === "Mentee"
 *   mentor     — users.role === "Mentor"
 *   corporate  — users.role === "CorporatePartner"
 *   ngo        — NGO partners
 *   content    — Moderator with "content" scope (or SuperAdmin)
 *   all        — SuperAdmin (or Moderator with "all" scope)
 */
export function canViewHelpDoc(
    session: HelpSessionContext | null,
    allowedRoles: HelpAudience[] | null | undefined,
): boolean {
    if (!allowedRoles || allowedRoles.length === 0) return false;

    // Guest
    if (!session || !session.role) {
        return allowedRoles.includes("guest");
    }

    const role = session.role;
    const scopes = effectiveScopes(role, session.moderationScope ?? null);

    // SuperAdmin can read any published help doc.
    if (role === "SuperAdmin") return true;
    if (role === "Moderator") {
        if (allowedRoles.includes("all") && scopes.includes("all")) return true;
        if (allowedRoles.includes("content") && (scopes.includes("content") || scopes.includes("all"))) return true;
        return false;
    }
    if (role === "Mentee" && allowedRoles.includes("mentee")) return true;
    if (role === "Mentor" && allowedRoles.includes("mentor")) return true;
    if (role === "CorporatePartner" && allowedRoles.includes("corporate")) return true;
    if (role === "NGO" && allowedRoles.includes("ngo")) return true;
    return false;
}
