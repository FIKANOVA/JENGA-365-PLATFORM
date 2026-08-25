import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import MenteeDashboard from "@/components/dashboard/Mentee/MenteeDashboard";
import { getAiMentorMatches } from "@/lib/actions/matching";
import { getMenteeLearningPathway, getMenteeMoodJournal } from "@/lib/db/queries/dashboard";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const metadata: Metadata = {
    title: "Mentee Dashboard | Jenga365",
    description: "Welcome to your Jenga365 Mentee Dashboard.",
};

export default async function MenteeDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);

    if (!session?.user?.id) {
        redirect("/login");
    }

    const userId = session.user.id;

    // Fetch fresh user record safely
    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
    }).catch(() => null);

    const [matches, pathway, journalEntries] = await Promise.all([
        getAiMentorMatches().catch(() => []),
        getMenteeLearningPathway(userId).catch(() => null),
        getMenteeMoodJournal(userId).catch(() => []),
    ]);

    const userName = dbUser?.name ?? session.user.name ?? "there";

    const sanitizedPathway = pathway
        ? {
              progress: Number((pathway as any).progress) || 0,
              milestones: Array.isArray((pathway as any).milestones) ? (pathway as any).milestones : [],
          }
        : null;

    return (
        <MenteeDashboard
            userName={userName}
            matches={matches || []}
            pathway={sanitizedPathway}
            journalEntries={(journalEntries || []).map((j: any) => ({
                id: String(j.id),
                recordedAt: j.recordedAt ? new Date(j.recordedAt).toISOString() : new Date().toISOString(),
                moodScore: Number(j.moodScore) || 3,
                notes: j.notes ?? null,
            }))}
            ndaSigned={Boolean(dbUser?.ndaSigned ?? (session.user as any)?.ndaSigned)}
            onboarded={Boolean(dbUser?.onboarded ?? (session.user as any)?.onboarded)}
            hasMentorMatch={(matches || []).length > 0}
        />
    );
}
