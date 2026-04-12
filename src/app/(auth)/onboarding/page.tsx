import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage({
    searchParams,
}: {
    searchParams: Promise<{ reason?: string }>;
}) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) redirect("/login");

    const user = session.user as any;

    // Guard: NDA must be signed before accessing onboarding
    if (!user.ndaSigned) redirect("/legal/nda");

    // Guard: Mentees must verify their email before proceeding to onboarding
    if (user.role === "Mentee" && !user.emailVerified) {
        redirect("/check-email");
    }

    // Guard: already onboarded → send to dashboard
    // Exception: when reason=interview_required, allow access so the Mentee can complete
    // the AI Interviewer. Without this exception, the dashboard embedding gate creates
    // an infinite redirect loop (dashboard → /onboarding → dashboard → ...).
    const { reason } = await searchParams;
    if (user.onboarded && reason !== "interview_required") {
        const roleMap: Record<string, string> = {
            Mentee: "/dashboard/mentee",
            Mentor: "/dashboard/mentor",
            CorporatePartner: "/dashboard/partner",
            Moderator: "/dashboard/moderator",
            SuperAdmin: "/dashboard/admin",
        };
        redirect(roleMap[user.role] ?? "/dashboard/mentee");
    }

    return <OnboardingClient />;
}
