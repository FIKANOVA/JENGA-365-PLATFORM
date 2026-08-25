import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMenteeLearningPathway } from "@/lib/db/queries/dashboard";
import LearningPathwayTracker from "@/components/dashboard/Mentee/LearningPathwayTracker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PathwayPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");
    const userId = session.user.id;

    const pathway = await getMenteeLearningPathway(userId).catch(() => null);

    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-display-md text-foreground mb-2">My pathway</h1>
                    <p className="text-body-sm text-foreground-muted">Your learning milestones and progress</p>
                </div>
                <LearningPathwayTracker pathway={pathway} />
            </div>
        </div>
    );
}
