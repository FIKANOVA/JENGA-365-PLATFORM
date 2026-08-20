import { parseScopes } from "@/lib/auth/roles";

export interface ScopePermissions {
    userApprovals: boolean;
    contentModeration: boolean;
    eventsManagement: boolean;
    corporateVetting: boolean;
}

export const SCOPE_TIER_LABELS: Record<string, string> = {
    all: "Tier 1 — Senior Moderator",
    mentor_applications: "Tier 2 — Approvals Moderator",
    content: "Tier 3 — Content Moderator",
    corporate: "Tier 4 — Corporate Vetting",
    E: "Tier 1 — Senior Moderator",
    A: "Tier 2 — Approvals Moderator",
    B: "Tier 3 — Content Moderator",
    C: "Tier 4 — Events & Community",
    D: "Tier 4 — Community Manager",
};

export function getScopePermissions(scope: string | null | undefined): ScopePermissions {
    if (!scope) {
        return { userApprovals: false, contentModeration: true, eventsManagement: false, corporateVetting: false };
    }

    // Try parsing as modern JSON array string e.g. ["content"] or ["all"]
    const scopes = parseScopes(scope);
    if (scopes.length > 0) {
        const isAll = scopes.includes("all");
        return {
            userApprovals: isAll || scopes.includes("mentor_applications"),
            contentModeration: isAll || scopes.includes("content"),
            eventsManagement: isAll || scopes.includes("mentor_applications"),
            corporateVetting: isAll || scopes.includes("corporate"),
        };
    }

    // Single-string or legacy letter checks
    if (scope === "E" || scope === "all") {
        return { userApprovals: true, contentModeration: true, eventsManagement: true, corporateVetting: true };
    }
    if (scope === "A" || scope === "mentor_applications") {
        return { userApprovals: true, contentModeration: false, eventsManagement: true, corporateVetting: false };
    }
    if (scope === "B" || scope === "content") {
        return { userApprovals: false, contentModeration: true, eventsManagement: false, corporateVetting: false };
    }
    if (scope === "C" || scope === "D") {
        return { userApprovals: false, contentModeration: false, eventsManagement: true, corporateVetting: false };
    }
    if (scope === "corporate") {
        return { userApprovals: false, contentModeration: false, eventsManagement: false, corporateVetting: true };
    }

    return { userApprovals: false, contentModeration: true, eventsManagement: false, corporateVetting: false };
}
