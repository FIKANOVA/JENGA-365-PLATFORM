import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { normalizeRole } from "@/lib/auth/roles";
import { getPublicProfileById } from "@/lib/db/queries/users";
import AIProfileClient from "./AIProfileClient";

export const metadata: Metadata = {
    title: "Profile & AI Interview | Jenga365",
    description: "View your rendered profile and refine your profile with Amani AI.",
};

const ALLOWED_ROLES = ["Mentee", "Mentor", "CorporatePartner", "NGO", "Moderator", "SuperAdmin"];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AIProfilePage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");

    const role = normalizeRole((session.user as any)?.role);
    if (!ALLOWED_ROLES.includes(role)) redirect("/dashboard");

    const profile = await getPublicProfileById(session.user.id);

    return (
        <div className="flex-1 p-6 md:p-10 lg:p-12 bg-background min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                <AIProfileClient profile={profile} userId={session.user.id} />
            </div>
        </div>
    );
}
