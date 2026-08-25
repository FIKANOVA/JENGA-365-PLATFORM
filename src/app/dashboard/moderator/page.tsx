import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ModeratorDashboard from "@/components/dashboard/Moderator/ModeratorDashboard";
import { getArticlesInReview, getPendingUsers } from "@/lib/db/queries/dashboard";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getScopePermissions } from "@/lib/constants/moderator-scopes";

export const metadata: Metadata = {
    title: "Moderator Hub | Jenga365",
    description: "Welcome to your Jenga365 Moderator Hub.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ModeratorDashboardPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");
    const role = (session.user as any)?.role;
    if (role !== "Moderator" && role !== "SuperAdmin") {
        redirect("/dashboard");
    }

    const dbUser = await db.query.users.findFirst({ where: eq(users.id, session.user.id) }).catch(() => null);
    const scope = dbUser?.moderationScope ?? "B";
    const perms = getScopePermissions(scope);

    const [articlesInReview, pendingUsers] = await Promise.all([
        perms.contentModeration ? getArticlesInReview().catch(() => []) : Promise.resolve([]),
        perms.userApprovals ? getPendingUsers().catch(() => [])         : Promise.resolve([]),
    ]);

    return (
        <ModeratorDashboard
            articlesInReview={articlesInReview}
            pendingUsers={pendingUsers}
            scope={scope}
        />
    );
}
