import { getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function RoleGuard({
    allowedRoles,
    children
}: {
    allowedRoles: string[],
    children: React.ReactNode
}) {
    const session = await getSession();

    if (!session || !allowedRoles.includes(session.user.role)) {
        return redirect("/dashboard");
    }

    return <>{children}</>;
}
