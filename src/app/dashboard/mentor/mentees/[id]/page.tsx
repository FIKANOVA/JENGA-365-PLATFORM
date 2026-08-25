import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { normalizeRole } from "@/lib/auth/roles";
import MenteeDetail from "@/components/dashboard/Mentor/MenteeDetail";

export const metadata: Metadata = {
    title: "Mentee Details | Jenga365",
    description: "Detailed view of Mentee.",
};

export default async function MenteeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }

    if (!session?.user) redirect("/login");
    const role = normalizeRole((session.user as any)?.role);
    if (role !== "Mentor" && role !== "SuperAdmin") {
        redirect("/dashboard");
    }

    const p = await params;
    return <MenteeDetail id={p.id} />;
}
