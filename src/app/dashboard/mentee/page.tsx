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
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch (e) {
        console.error("[MenteeDashboardPage] session fetch failed:", e);
    }

    if (!session?.user?.id) {
        redirect("/login");
    }

    const userId = session.user.id;

    let dbUser = null;
    let matches: any[] = [];
    let pathway: any = null;
    let journalEntries: any[] = [];

    try {
        dbUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });
    } catch (err) {
        console.error("[MenteeDashboard] dbUser query failed:", err);
    }

    try {
        matches = await getAiMentorMatches();
    } catch (err) {
        console.error("[MenteeDashboard] matches query failed:", err);
    }

    try {
        pathway = await getMenteeLearningPathway(userId);
    } catch (err) {
        console.error("[MenteeDashboard] pathway query failed:", err);
    }

    try {
        journalEntries = await getMenteeMoodJournal(userId);
    } catch (err) {
        console.error("[MenteeDashboard] journal query failed:", err);
    }

    const userName = dbUser?.name ?? session.user.name ?? "there";

    const sanitizedPathway = pathway
        ? {
              progress: Number((pathway as any).progress) || 0,
              milestones: Array.isArray((pathway as any).milestones) ? (pathway as any).milestones : [],
          }
        : null;

    const sanitizedJournal = (journalEntries || []).map((j: any) => ({
        id: String(j.id || Math.random()),
        recordedAt: j.recordedAt ? new Date(j.recordedAt).toISOString() : new Date().toISOString(),
        moodScore: Number(j.moodScore) || 3,
        notes: j.notes ?? null,
    }));

    return (
        <MenteeDashboard
            userName={userName}
            matches={matches || []}
            pathway={sanitizedPathway}
            journalEntries={sanitizedJournal}
            ndaSigned={Boolean(dbUser?.ndaSigned ?? (session.user as any)?.ndaSigned)}
            onboarded={Boolean(dbUser?.onboarded ?? (session.user as any)?.onboarded)}
            hasMentorMatch={(matches || []).length > 0}
        />
    );
}
