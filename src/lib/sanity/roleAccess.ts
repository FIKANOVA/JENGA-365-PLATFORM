import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type EffectiveRole =
    | "SuperAdmin"
    | "Moderator"
    | "Mentor"
    | "Mentee"
    | "CorporatePartner"
    | "NGO";

// undefined = unfiltered (SuperAdmin sees every schema)
// empty array = no schemas; these roles are not given Studio access at all and
// are redirected to /dashboard/articles when they hit /studio.
export const STUDIO_ALLOWED_SCHEMAS: Record<EffectiveRole, string[] | undefined> = {
    SuperAdmin: undefined,
    Moderator: [
        "article", "product", "resource", "event", "eventComment",
        "helpTopic", "voices", "video", "userManual", "author",
        "speaker", "siteSettings", "teamOfficial",
    ],
    Mentor: [],
    Mentee: [],
    CorporatePartner: ["partner", "voices"],
    NGO: ["partner"],
};

export const STUDIO_BLOCKED_ROLES: EffectiveRole[] = ["Mentor", "Mentee"];

export async function resolveEffectiveRole(
    userId: string,
    role: string,
): Promise<EffectiveRole> {
    // NGO is now a first-class role. Legacy fallback: older NGO accounts that were left on
    // the CorporatePartner role (pre-migration 0018) are still detected via metadata.orgType.
    if (role === "CorporatePartner") {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { metadata: true },
        });
        const orgType = (dbUser?.metadata as { orgType?: string } | null)?.orgType;
        if (orgType === "NGO") return "NGO";
    }
    if (
        role === "SuperAdmin" ||
        role === "Moderator" ||
        role === "Mentor" ||
        role === "Mentee" ||
        role === "CorporatePartner" ||
        role === "NGO"
    ) {
        return role;
    }
    return "Mentee";
}
