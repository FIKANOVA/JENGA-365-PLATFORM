/**
 * Jenga365 — Scoped Role Hierarchy (Module 11)
 *
 * 6 roles: Mentee → Mentor → CorporatePartner → Moderator → SuperAdmin
 * Moderators have scoped permissions: A, B, C, D, or E (full).
 *
 * Scope A — User Approvals
 * Scope B — Content Management
 * Scope C — Events Management
 * Scope D — Community Management
 * Scope E — Full Moderator (all scopes)
 */

export type Role =
    | "Mentee"
    | "Mentor"
    | "CorporatePartner"
    | "Moderator"
    | "SuperAdmin";

export type ModeratorScope = "A" | "B" | "C" | "D" | "E";

export const SCOPE_LABELS: Record<ModeratorScope, string> = {
    A: "User Approvals",
    B: "Content Management",
    C: "Events Management",
    D: "Community Management",
    E: "Full Moderator",
};

// ── Hierarchy ────────────────────────────────────────────────
// Higher index = more privileged. Used for inheritance checks.
const ROLE_HIERARCHY: Record<Role, number> = {
    Mentee: 0,
    Mentor: 1,
    CorporatePartner: 2,
    Moderator: 3,
    SuperAdmin: 4,
};

/**
 * Check whether `userRole` is at least as privileged as `requiredRole`.
 * SuperAdmin passes every check.
 */
export function hasRoleAccess(userRole: Role, requiredRole: Role): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// ── Scope Utilities ──────────────────────────────────────────

/** Parse the JSON-encoded scope string stored in the user record. */
export function parseScopes(scopeString?: string | null): ModeratorScope[] {
    if (!scopeString) return [];
    try {
        const parsed = JSON.parse(scopeString);
        if (Array.isArray(parsed)) return parsed as ModeratorScope[];
        return [];
    } catch {
        return [];
    }
}

/** Encode scopes into a JSON string for storage. */
export function encodeScopes(scopes: ModeratorScope[]): string {
    return JSON.stringify([...new Set(scopes)]);
}

/** Check whether a moderator has a specific scope (or is Full/E). */
export function hasScope(
    scopes: ModeratorScope[],
    required: ModeratorScope
): boolean {
    if (scopes.includes("E")) return true; // Full moderator
    return scopes.includes(required);
}

/** SuperAdmins always have all scopes. Short-circuit check. */
export function effectiveScopes(
    role: Role,
    scopeString?: string | null
): ModeratorScope[] {
    if (role === "SuperAdmin") return ["A", "B", "C", "D", "E"];
    if (role !== "Moderator") return [];
    return parseScopes(scopeString);
}

// ── Route → Required Scope Map ───────────────────────────────
// Used by middleware & sidebar to gate access.

export const SCOPED_ROUTES: Record<string, ModeratorScope> = {
    // Scope A — User Approvals
    "/dashboard/moderator/approvals": "A",
    "/dashboard/moderator/mentor-queue": "A",
    "/dashboard/moderator/corporate-queue": "A",
    "/dashboard/moderator/mentee-flags": "A",

    // Scope B — Content
    "/dashboard/moderator/articles": "B",
    "/dashboard/moderator/resources": "B",
    "/dashboard/moderator/inventory": "B",
    "/dashboard/moderator/studio/articles": "B",
    "/dashboard/moderator/studio/resources": "B",
    "/dashboard/moderator/studio/product": "B",

    // Scope C — Events
    "/dashboard/moderator/events": "C",
    "/dashboard/moderator/webinars": "C",
    "/dashboard/moderator/clinics": "C",
    "/dashboard/moderator/studio/events": "C",
    "/dashboard/moderator/studio/clinics": "C",

    // Scope D — Community
    "/dashboard/moderator/partners": "D",
    "/dashboard/moderator/people": "D",
    "/dashboard/moderator/speakers": "D",
    "/dashboard/moderator/coaches": "D",
    "/dashboard/moderator/team": "D",
    "/dashboard/moderator/studio/people": "D",
    "/dashboard/moderator/studio/partners": "D",
};

// ── Sidebar Nav Items (rendered dynamically by scope) ────────

export interface SidebarItem {
    label: string;
    href: string;
    scope: ModeratorScope;
    badge?: string; // e.g. pending count
    isStudio?: boolean;
}

export const MODERATOR_SIDEBAR: SidebarItem[] = [
    // Scope A
    { label: "Mentor Queue", href: "/dashboard/moderator/mentor-queue", scope: "A" },
    { label: "Mentee Flags", href: "/dashboard/moderator/mentee-flags", scope: "A" },
    { label: "Corporate Queue", href: "/dashboard/moderator/corporate-queue", scope: "A" },

    // Scope B
    { label: "Article Queue", href: "/dashboard/moderator/articles", scope: "B" },
    { label: "Resource Library", href: "/dashboard/moderator/resources", scope: "B" },
    { label: "Inventory Management", href: "/dashboard/moderator/inventory", scope: "B" },
    { label: "Create Resource", href: "/dashboard/moderator/studio;resource", scope: "B", isStudio: true },
    { label: "Sanity Studio → Articles", href: "/dashboard/moderator/studio/articles", scope: "B", isStudio: true },
    { label: "Sanity Studio → Resources", href: "/dashboard/moderator/studio/resources", scope: "B", isStudio: true },
    { label: "Sanity Studio → Products", href: "/dashboard/moderator/studio/product", scope: "B", isStudio: true },

    // Scope C
    { label: "Events & Clinics", href: "/dashboard/moderator/events", scope: "C" },
    { label: "Webinars", href: "/dashboard/moderator/webinars", scope: "C" },
    { label: "Sanity Studio → Events", href: "/dashboard/moderator/studio/events", scope: "C", isStudio: true },
    { label: "Sanity Studio → Clinics", href: "/dashboard/moderator/studio/clinics", scope: "C", isStudio: true },

    // Scope D
    { label: "Partner Management", href: "/dashboard/moderator/partners", scope: "D" },
    { label: "People Directory", href: "/dashboard/moderator/people", scope: "D" },
    { label: "Speakers", href: "/dashboard/moderator/speakers", scope: "D" },
    { label: "Coaches", href: "/dashboard/moderator/coaches", scope: "D" },
    { label: "Team Members", href: "/dashboard/moderator/team", scope: "D" },
    { label: "Sanity Studio → People", href: "/dashboard/moderator/studio/people", scope: "D", isStudio: true },
    { label: "Sanity Studio → Partners", href: "/dashboard/moderator/studio/partners", scope: "D", isStudio: true },
];

/** Filter sidebar items to only those the user can access. */
export function getVisibleSidebar(scopes: ModeratorScope[]): SidebarItem[] {
    return MODERATOR_SIDEBAR.filter((item) => hasScope(scopes, item.scope));
}

// ── Approval Requirements ────────────────────────────────────

export function requiresApproval(role: Role): boolean {
    return role === "Mentor" || role === "CorporatePartner";
}

export function isAutoApproved(role: Role): boolean {
    return role === "Mentee";
}
