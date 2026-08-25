import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { normalizeRole } from "@/lib/auth/roles";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    let session = null;
    try {
        session = await auth.api.getSession({
            headers: await headers(),
        });
    } catch {
        // ignore
    }

    if (!session) {
        redirect("/login");
    }

    const sessionUser = session.user as {
        id: string;
        role?: string;
    };
    const effectiveRole = normalizeRole(sessionUser.role);

    return (
        <DashboardShell role={effectiveRole}>
            {children}
        </DashboardShell>
    );
}
