import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { normalizeRole } from "@/lib/auth/roles";
import { getMyDirectory } from "@/lib/actions/userSearch";
import DirectoryView from "@/components/dashboard/shared/DirectoryView";

export default async function PeoplePage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");

    const role = normalizeRole((session.user as any)?.role);

    // SuperAdmin has the full user-management table on the admin hub.
    if (role === "SuperAdmin") redirect("/dashboard/admin");
    // Corporate/NGO partners browse the public mentor directory.
    if (role === "CorporatePartner" || role === "NGO") redirect("/mentors");

    // Mentee → assigned mentor(s); Mentor → assigned mentees; Moderator → scoped directory.
    const data = await getMyDirectory().catch(() => ({ self: null, records: [] }));
    return <DirectoryView data={data as any} />;
}
