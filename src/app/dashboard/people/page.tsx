import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMyDirectory } from "@/lib/actions/userSearch";
import DirectoryView from "@/components/dashboard/shared/DirectoryView";

export default async function PeoplePage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login");

    const role = (session.user as { role?: string }).role;

    // SuperAdmin has the full user-management table on the admin hub.
    if (role === "SuperAdmin") redirect("/dashboard/admin");
    // Corporate/NGO partners browse the public mentor directory.
    if (role === "CorporatePartner" || role === "NGO") redirect("/mentors");

    // Mentee → assigned mentor(s); Mentor → assigned mentees; Moderator → scoped directory.
    const data = await getMyDirectory();
    return <DirectoryView data={data} />;
}
