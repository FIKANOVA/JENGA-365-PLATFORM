export const SCOPE_PERMISSIONS = {
    A: { userApprovals: true,  contentModeration: false, eventsManagement: false },
    B: { userApprovals: false, contentModeration: true,  eventsManagement: false },
    C: { userApprovals: false, contentModeration: false, eventsManagement: true  },
    D: { userApprovals: false, contentModeration: false, eventsManagement: true  },
    E: { userApprovals: true,  contentModeration: true,  eventsManagement: true  },
} as const;

export type ModeratorScope = keyof typeof SCOPE_PERMISSIONS;

export const SCOPE_TIER_LABELS: Record<string, string> = {
    E: "Tier 1 — Senior Moderator",
    A: "Tier 2 — Approvals Moderator",
    B: "Tier 3 — Content Moderator",
    C: "Tier 4 — Events & Community",
    D: "Tier 4 — Community Manager",
};

export function getScopePermissions(scope: string | null | undefined) {
    const key = (scope ?? "B") as ModeratorScope;
    return SCOPE_PERMISSIONS[key] ?? SCOPE_PERMISSIONS["B"];
}
