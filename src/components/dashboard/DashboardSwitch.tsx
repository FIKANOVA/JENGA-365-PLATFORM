import { getSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import MentorDashboard from "./Mentor/MentorDashboard";
import MenteeDashboard from "./Mentee/MenteeDashboard";
import AdminDashboard from "./Admin/AdminDashboard";
import ModeratorDashboard from "./Moderator/ModeratorDashboard";
import PartnerDashboard from "./Partner/PartnerDashboard";

export default async function DashboardSwitch() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const role = session.user.role;

    switch (role) {
        case "SuperAdmin":
            return <AdminDashboard />;
        case "Moderator":
            return <ModeratorDashboard />;
        case "Mentor":
            return <MentorDashboard />;
        case "CorporatePartner":
            return <PartnerDashboard />;
        case "Mentee":
        default:
            return <MenteeDashboard />;
    }
}
