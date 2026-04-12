import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import PendingApprovalClient from "./PendingApprovalClient";

export default async function PendingApprovalPage() {
    const session = await getSession();

    if (!session) redirect("/login");

    const user = session.user as any;

    // Only users with status "pending" belong on this page
    if (user.status !== "pending") {
        const roleMap: Record<string, string> = {
            Mentee: "/dashboard/mentee",
            Mentor: "/dashboard/mentor",
            CorporatePartner: "/dashboard/partner",
            Moderator: "/dashboard/moderator",
            SuperAdmin: "/dashboard/admin",
        };
        redirect(roleMap[user.role] ?? "/dashboard/mentee");
    }

    return <PendingApprovalClient role={user.role} />;
}
