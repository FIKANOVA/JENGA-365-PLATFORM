import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import MenteeDashboard from "@/components/dashboard/Mentee/MenteeDashboard";
import { getAiMentorMatches } from "@/lib/actions/matching";
import { getMenteeLearningPathway, getMenteeMoodJournal } from "@/lib/db/queries/dashboard";

export const metadata: Metadata = {
    title: "Mentee Dashboard | Jenga365",
    description: "Welcome to your Jenga365 Mentee Dashboard.",
};

export default async function MenteeDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;

    const [matches, pathway, journalEntries] = await Promise.all([
        userId ? getAiMentorMatches().catch(() => []) : Promise.resolve([]),
        userId ? getMenteeLearningPathway(userId).catch(() => null) : Promise.resolve(null),
        userId ? getMenteeMoodJournal(userId).catch(() => []) : Promise.resolve([]),
    ]);

    const userName = session?.user?.name ?? "there";
    const user = session?.user as any;

    return (
        <MenteeDashboard
            userName={userName}
            matches={matches}
            pathway={pathway}
            journalEntries={journalEntries}
            ndaSigned={user?.ndaSigned ?? false}
            onboarded={user?.onboarded ?? false}
            hasMentorMatch={matches.length > 0}
        />
    );
}
