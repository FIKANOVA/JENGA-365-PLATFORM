import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/dashboard/Admin/AdminDashboard";
import { getAllUsers } from "@/lib/db/queries/dashboard";
import { auth } from "@/lib/auth/config";

export const metadata: Metadata = {
    title: "SuperAdmin Hub | Jenga365",
    description: "Welcome to your Jenga365 Superadmin Control Center.",
};

export default async function AdminDashboardPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login");

    const allUsers = await getAllUsers().catch(() => []);

    const stats = [
        { label: "Total Users", value: String(allUsers.length), trend: "neutral" as const, change: "Live from DB" },
        { label: "Pending Approval", value: String(allUsers.filter(u => !u.isApproved).length), trend: "neutral" as const, change: "" },
        { label: "Active Mentors", value: String(allUsers.filter(u => u.role === "Mentor" && u.isApproved).length), trend: "up" as const, change: "" },
        { label: "Active Mentees", value: String(allUsers.filter(u => u.role === "Mentee" && u.isApproved).length), trend: "up" as const, change: "" },
    ];

    return <AdminDashboard users={allUsers} stats={stats} currentUserId={session.user.id} />;
}
