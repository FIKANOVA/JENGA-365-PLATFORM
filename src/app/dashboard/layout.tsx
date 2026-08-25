import DashboardShell from "@/components/dashboard/DashboardShell";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const sessionUser = session.user as {
        id: string;
        role?: string;
    };
    const effectiveRole = sessionUser.role ?? "Mentee";

    return (
        <DashboardShell role={effectiveRole}>
            {children}
        </DashboardShell>
    );
}
