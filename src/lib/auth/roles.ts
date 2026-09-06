export type Role =
    | "Mentee"
    | "Mentor"
    | "CorporatePartner"
    | "NGO"
    | "Moderator"
    | "SuperAdmin";

export function normalizeRole(r?: string | null): Role {
    if (!r) return "Mentee";
    const lower = r.toLowerCase().replace(/[-_]/g, "");
    if (lower === "superadmin" || lower === "admin") return "SuperAdmin";
    if (lower === "moderator") return "Moderator";
    if (lower === "mentor") return "Mentor";
    if (lower === "corporatepartner" || lower === "partner" || lower === "corporate") return "CorporatePartner";
    if (lower === "ngo") return "NGO";
    return "Mentee";
}

export function getDashboardHref(role?: string | null): string {
    const r = normalizeRole(role);
    switch (r) {
        case "Mentee":
            return "/dashboard/mentee";
        case "Mentor":
            return "/dashboard/mentor";
        case "CorporatePartner":
            return "/dashboard/partner";
        case "NGO":
            return "/dashboard/ngo";
        case "Moderator":
            return "/dashboard/moderator";
        case "SuperAdmin":
            return "/dashboard/admin";
        default:
            return "/dashboard/mentee";
    }
}

/** Both org-partner roles share partner surfaces (impact stats, partner profile, studio). */
export function isPartnerRole(role: string | null | undefined): boolean {
    const norm = normalizeRole(role);
    return norm === "CorporatePartner" || norm === "NGO";
}

export type ModeratorScope = "mentor_applications" | "corporate" | "content" | "all";

export type Capability =
    | "APPROVE_MENTOR_APPLICATION"
    | "APPROVE_MENTEE_APPLICATION"
    | "INITIATE_THREE_STRIKES_SUSPENSION"
    | "APPROVE_RUGBY_CLINIC"
    | "MANAGE_WEBINAR_LOGISTICS"
    | "VET_CORPORATE_PARTNER"
    | "INTAKE_SPATIAL_DATA"
    | "VERIFY_TREE_SURVIVAL_AUDIT"
    | "APPROVE_ARTICLE"
    | "PUBLISH_ARTICLE"
    | "UPSERT_MERCHANDISE_STOCK"
    | "GENERATE_CORPORATE_INVITE_JWT"
    | "COSIGN_PERMANENT_SUSPENSION"
    | "UNLOCK_CORPORATE_ESG_FUNDS"
    | "ACCESS_SHADOW_VIEW"
    | "CREATE_MODERATOR_ACCOUNT";

// Scopes that grant each capability. Empty array = SuperAdmin only.
export const CAPABILITIES: Record<Capability, ModeratorScope[]> = {
    APPROVE_MENTOR_APPLICATION:         ["mentor_applications", "all"],
    APPROVE_MENTEE_APPLICATION:         ["mentor_applications", "all"],
    INITIATE_THREE_STRIKES_SUSPENSION:  ["mentor_applications", "all"],
    APPROVE_RUGBY_CLINIC:               ["mentor_applications", "all"],
    MANAGE_WEBINAR_LOGISTICS:           ["mentor_applications", "all"],
    VET_CORPORATE_PARTNER:              ["corporate", "all"],
    INTAKE_SPATIAL_DATA:                ["corporate", "all"],
    VERIFY_TREE_SURVIVAL_AUDIT:         ["corporate", "all"],
    APPROVE_ARTICLE:                    ["content", "all"],
    PUBLISH_ARTICLE:                    ["content", "all"],
    UPSERT_MERCHANDISE_STOCK:           ["content", "all"],
    GENERATE_CORPORATE_INVITE_JWT:      [],
    COSIGN_PERMANENT_SUSPENSION:        [],
    UNLOCK_CORPORATE_ESG_FUNDS:         [],
    ACCESS_SHADOW_VIEW:                 [],
    CREATE_MODERATOR_ACCOUNT:           [],
};

export function parseScopes(scopeString?: string | null): ModeratorScope[] {
    if (!scopeString) return [];
    try {
        const parsed = JSON.parse(scopeString);
        if (Array.isArray(parsed)) {
            const valid: ModeratorScope[] = ["mentor_applications", "corporate", "content", "all"];
            return parsed.filter((v): v is ModeratorScope => valid.includes(v));
        }
    } catch {
        // Fall back to plain string or legacy tier code
    }

    const s = scopeString.trim();
    if (s === "all" || s === "E") return ["all"];
    if (s === "content" || s === "B") return ["content"];
    if (s === "mentor_applications" || s === "A") return ["mentor_applications"];
    if (s === "corporate") return ["corporate"];
    return [];
}

export function encodeScopes(scopes: ModeratorScope[]): string {
    return JSON.stringify([...new Set(scopes)]);
}

export function effectiveScopes(
    role: Role,
    scopeString?: string | null
): ModeratorScope[] {
    if (role === "SuperAdmin") return ["mentor_applications", "corporate", "content", "all"];
    if (role !== "Moderator") return [];
    return parseScopes(scopeString);
}

export function hasCapability(
    role: Role,
    scopes: ModeratorScope[],
    cap: Capability
): boolean {
    if (role === "SuperAdmin") return true;
    if (role !== "Moderator") return false;
    const allowed = CAPABILITIES[cap];
    if (allowed.length === 0) return false;
    return allowed.some((s) => scopes.includes(s));
}

export function requiresApproval(role: Role): boolean {
    return role === "Mentor" || role === "CorporatePartner" || role === "NGO";
}

// NOTE: only routes that actually ship as pages belong here. Moderator approval
// queues are consolidated into the single /dashboard/moderator hub (sections, not
// routes) and are gated inside that page by scope — so they are intentionally not
// listed. Creating a moderator is a modal on the /dashboard/admin hub, not a route.
export const ROUTE_CAPABILITIES: Array<[string, Capability]> = [
    ["/dashboard/moderator/inventory",       "UPSERT_MERCHANDISE_STOCK"],
    ["/dashboard/admin/shadow",              "ACCESS_SHADOW_VIEW"],
    ["/dashboard/admin/cosign",              "COSIGN_PERMANENT_SUSPENSION"],
    ["/dashboard/admin/corporate-invite",    "GENERATE_CORPORATE_INVITE_JWT"],
    ["/dashboard/admin/esg-unlock",          "UNLOCK_CORPORATE_ESG_FUNDS"],
];

export function capabilityForRoute(pathname: string): Capability | null {
    const match = ROUTE_CAPABILITIES.find(([prefix]) => pathname.startsWith(prefix));
    return match ? match[1] : null;
}
