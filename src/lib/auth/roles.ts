export type Role =
    | "Mentee"
    | "Mentor"
    | "CorporatePartner"
    | "Moderator"
    | "SuperAdmin";

export type ModeratorScope = "welfare" | "meal" | "commerce" | "all";

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
    | "UPSERT_MERCHANDISE_STOCK"
    | "GENERATE_CORPORATE_INVITE_JWT"
    | "COSIGN_PERMANENT_SUSPENSION"
    | "UNLOCK_CORPORATE_ESG_FUNDS"
    | "ACCESS_SHADOW_VIEW"
    | "CREATE_MODERATOR_ACCOUNT";

// Scopes that grant each capability. Empty array = SuperAdmin only.
export const CAPABILITIES: Record<Capability, ModeratorScope[]> = {
    APPROVE_MENTOR_APPLICATION:         ["welfare", "all"],
    APPROVE_MENTEE_APPLICATION:         ["welfare", "all"],
    INITIATE_THREE_STRIKES_SUSPENSION:  ["welfare", "all"],
    APPROVE_RUGBY_CLINIC:               ["welfare", "all"],
    MANAGE_WEBINAR_LOGISTICS:           ["welfare", "all"],
    VET_CORPORATE_PARTNER:              ["meal", "all"],
    INTAKE_SPATIAL_DATA:                ["meal", "all"],
    VERIFY_TREE_SURVIVAL_AUDIT:         ["meal", "all"],
    APPROVE_ARTICLE:                    ["commerce", "all"],
    UPSERT_MERCHANDISE_STOCK:           ["commerce", "all"],
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
        if (!Array.isArray(parsed)) return [];
        const valid: ModeratorScope[] = ["welfare", "meal", "commerce", "all"];
        return parsed.filter((v): v is ModeratorScope => valid.includes(v));
    } catch {
        return [];
    }
}

export function encodeScopes(scopes: ModeratorScope[]): string {
    return JSON.stringify([...new Set(scopes)]);
}

export function effectiveScopes(
    role: Role,
    scopeString?: string | null
): ModeratorScope[] {
    if (role === "SuperAdmin") return ["welfare", "meal", "commerce", "all"];
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
    return role === "Mentor" || role === "CorporatePartner";
}

export const ROUTE_CAPABILITIES: Array<[string, Capability]> = [
    ["/dashboard/moderator/mentor-queue",    "APPROVE_MENTOR_APPLICATION"],
    ["/dashboard/moderator/mentee-flags",    "INITIATE_THREE_STRIKES_SUSPENSION"],
    ["/dashboard/moderator/clinics",         "APPROVE_RUGBY_CLINIC"],
    ["/dashboard/moderator/webinars",        "MANAGE_WEBINAR_LOGISTICS"],
    ["/dashboard/moderator/corporate-queue", "VET_CORPORATE_PARTNER"],
    ["/dashboard/moderator/spatial",         "INTAKE_SPATIAL_DATA"],
    ["/dashboard/moderator/tree-audits",     "VERIFY_TREE_SURVIVAL_AUDIT"],
    ["/dashboard/moderator/articles",        "APPROVE_ARTICLE"],
    ["/dashboard/moderator/inventory",       "UPSERT_MERCHANDISE_STOCK"],
    ["/dashboard/admin/shadow",              "ACCESS_SHADOW_VIEW"],
    ["/dashboard/admin/cosign",              "COSIGN_PERMANENT_SUSPENSION"],
    ["/dashboard/admin/corporate-invite",    "GENERATE_CORPORATE_INVITE_JWT"],
    ["/dashboard/admin/esg-unlock",          "UNLOCK_CORPORATE_ESG_FUNDS"],
    ["/dashboard/admin/moderators",          "CREATE_MODERATOR_ACCOUNT"],
];

export function capabilityForRoute(pathname: string): Capability | null {
    const match = ROUTE_CAPABILITIES.find(([prefix]) => pathname.startsWith(prefix));
    return match ? match[1] : null;
}
