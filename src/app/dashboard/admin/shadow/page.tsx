import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { normalizeRole } from "@/lib/auth/roles";
import { getAllUsers } from "@/lib/db/queries/dashboard";
import ShadowView, { type ShadowUser } from "@/components/dashboard/Admin/ShadowView";

export default async function ShadowViewPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");
    if (normalizeRole((session.user as any)?.role) !== "SuperAdmin") redirect("/dashboard");

    const allUsers = await getAllUsers().catch(() => []);
    const users: ShadowUser[] = allUsers
        .filter((u) => u.id !== session.user.id)
        .map((u) => ({
            id: u.id,
            name: u.name ?? u.email,
            role: u.role ?? "—",
            email: u.email,
        }));

    return <ShadowView users={users} />;
}
