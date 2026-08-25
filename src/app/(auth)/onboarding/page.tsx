import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage({
    searchParams,
}: {
    searchParams: Promise<{ reason?: string }>;
}) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) redirect("/login");

    const sessionUser = session.user as any;
    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { role: true, ndaSigned: true, emailVerified: true, onboarded: true, intakeCompleted: true },
    });

    const user = { ...sessionUser, ...dbUser };

    // 1. Guard: NDA must be signed before accessing onboarding
    if (!user.ndaSigned) redirect("/legal/nda");

    // 2. Guard: Mentees must verify their email before proceeding
    if (user.role === "Mentee" && !user.emailVerified) {
        redirect("/check-email");
    }

    // 3. For Mentees: if intake is not complete, go directly to Diagnostic Intake
    if (user.role === "Mentee" && !user.intakeCompleted) {
        redirect("/onboarding/intake");
    }

    // 4. If AI interview was specifically requested, forward to in-dashboard AI interview page
    const { reason } = await searchParams;
    if (reason === "interview_required") {
        redirect("/dashboard/profile");
    }

    // 5. Otherwise route to the appropriate role dashboard or pending approval
    const roleMap: Record<string, string> = {
        Mentee: "/dashboard/mentee",
        Mentor: "/dashboard/mentor",
        CorporatePartner: "/dashboard/partner",
        NGO: "/dashboard/ngo",
        Moderator: "/dashboard/moderator",
        SuperAdmin: "/dashboard/admin",
    };
    redirect(roleMap[user.role] ?? "/dashboard/mentee");
}
