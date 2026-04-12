import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PeoplePage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");
    const role = (session.user as any).role as string;

    // Redirect to the role-specific people view where it exists
    if (role === "Mentor") redirect("/dashboard/mentor/mentees");
    if (role === "SuperAdmin") redirect("/dashboard/admin");

    // For Mentee, Moderator, CorporatePartner — show mentor directory
    redirect("/mentors");
}
