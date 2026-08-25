import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { normalizeRole } from "@/lib/auth/roles";
import AIProfileClient from "./AIProfileClient";

export const metadata: Metadata = {
    title: "AI Profile Interview | Jenga365",
    description: "Refine your profile with Amani AI to improve your mentor match quality.",
};

const ALLOWED_ROLES = ["Mentee", "Mentor", "CorporatePartner", "NGO", "SuperAdmin"];

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

    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-display-md text-foreground mb-2">AI profile interview</h1>
                    <p className="text-body-sm text-foreground-muted">
                        Chat with Amani AI to refine your profile. A stronger profile improves your match quality.
                        This is optional — you have full platform access regardless.
                    </p>
                </div>

                <div
                    className="rounded-md border border-border bg-background p-6 space-y-2"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                >
                    <p className="text-eyebrow text-foreground-muted">What happens</p>
                    <ul className="text-body-sm text-foreground space-y-1 list-disc list-inside">
                        <li>Amani guides you through a short 5-phase conversation</li>
                        <li>Your answers generate a profile embedding stored securely</li>
                        <li>The embedding is used to surface better mentor/mentee matches</li>
                        <li>You can retake the interview at any time to update your profile</li>
                    </ul>
                </div>

                <AIProfileClient />
            </div>
        </div>
    );
}
