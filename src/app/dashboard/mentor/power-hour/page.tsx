import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PowerHourForm from "./PowerHourForm";

export default async function PowerHourPage() {
    let session = null;
    try {
        session = await auth.api.getSession({
            headers: await headers(),
        });
    } catch {
        // ignore
    }

    if (!session?.user) redirect("/login");
    const role = (session.user as any)?.role;
    if (role !== "Mentor" && role !== "SuperAdmin") {
        redirect("/dashboard");
    }

    return <PowerHourForm mentorId={session.user.id} />;
}
