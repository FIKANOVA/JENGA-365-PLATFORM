import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ModeratorDashboard from "@/components/dashboard/Moderator/ModeratorDashboard";
import { getArticlesInReview, getPendingUsers } from "@/lib/db/queries/dashboard";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
    title: "Moderator Hub | Jenga365",
    description: "Welcome to your Jenga365 Moderator Hub.",
};

export default async function ModeratorDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const dbUser = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
    const scope = dbUser?.moderationScope ?? "B";

    const [articlesInReview, pendingUsers] = await Promise.all([
        (scope === "B" || scope === "E") ? getArticlesInReview().catch(() => []) : Promise.resolve([]),
        (scope === "A" || scope === "E") ? getPendingUsers().catch(() => [])     : Promise.resolve([]),
    ]);

    return (
        <ModeratorDashboard
            articlesInReview={articlesInReview}
            pendingUsers={pendingUsers}
            scope={scope}
        />
    );
}
