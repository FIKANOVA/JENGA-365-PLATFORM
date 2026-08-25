import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { normalizeRole } from "@/lib/auth/roles";
import CorporateInviteForm from "@/components/dashboard/Admin/CorporateInviteForm";

export const metadata: Metadata = {
    title: "Corporate Invite | Jenga365",
    description: "Issue a fast-track JWT invite for a Corporate Partner.",
};

export default async function CorporateInvitePage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");
    if (normalizeRole((session.user as any)?.role) !== "SuperAdmin") redirect("/dashboard");

    return (
        <div className="mx-auto max-w-2xl px-6 lg:px-8 py-8">
            <h1 className="text-display-sm text-foreground">Corporate partner invite</h1>
            <p className="text-body-sm text-foreground-muted mt-1 mb-6">
                Generates a signed 7-day JWT invite that fast-tracks corporate-partner vetting.
            </p>
            <CorporateInviteForm />
        </div>
    );
}
