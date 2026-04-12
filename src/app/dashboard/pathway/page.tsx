import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMenteeLearningPathway } from "@/lib/db/queries/dashboard";
import LearningPathwayTracker from "@/components/dashboard/Mentee/LearningPathwayTracker";

export default async function PathwayPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");
    const userId = session.user.id;

    const pathway = await getMenteeLearningPathway(userId).catch(() => null);

    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="font-playfair text-4xl font-black text-foreground mb-2">My Pathway</h1>
                    <p className="text-muted-foreground font-mono text-sm">Your learning milestones and progress</p>
                </div>
                <LearningPathwayTracker pathway={pathway} />
            </div>
        </div>
    );
}
