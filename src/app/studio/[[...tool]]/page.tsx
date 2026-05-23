import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { Studio } from "@/components/sanity/Studio";
import {
    resolveEffectiveRole,
    STUDIO_ALLOWED_SCHEMAS,
    STUDIO_BLOCKED_ROLES,
} from "@/lib/sanity/roleAccess";
import { ensureAuthorDoc } from "@/lib/sanity/ensureAuthor";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const ROLES_NEEDING_AUTHOR_DOC = new Set([
    "SuperAdmin",
    "Moderator",
]);

export default async function StudioPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login?next=/studio");

    const role = await resolveEffectiveRole(session.user.id, (session.user as any).role);

    // Mentor/Mentee can't touch Sanity directly — they author via in-app form.
    if (STUDIO_BLOCKED_ROLES.includes(role)) {
        redirect("/dashboard/articles");
    }

    const allowed = STUDIO_ALLOWED_SCHEMAS[role];
    const enableVision = role === "SuperAdmin" || role === "Moderator";

    if (ROLES_NEEDING_AUTHOR_DOC.has(role)) {
        const dbUser = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { metadata: true },
        });
        const meta = (dbUser?.metadata as { bio?: string; professionalTitle?: string } | null) ?? null;
        await ensureAuthorDoc({
            userId: session.user.id,
            name: session.user.name,
            email: session.user.email,
            bio: meta?.bio ?? null,
            role: meta?.professionalTitle ?? null,
        }).catch((err) => {
            console.error("[studio] ensureAuthorDoc failed:", err);
        });
    }

    return (
        <div className="w-full h-screen overflow-hidden">
            <Studio
                basePath="/studio"
                allowedSchemaTypes={allowed}
                enableVision={enableVision}
                currentUserId={session.user.id}
                currentUserRole={role}
            />
        </div>
    );
}
