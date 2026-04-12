import { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import SettingsPage from "@/components/dashboard/SettingsPage";

export const metadata: Metadata = {
    title: "Account Settings | Jenga365",
    description: "Manage your Jenga365 profile and account security.",
};

export default async function DashboardSettingsPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user;

    return (
        <SettingsPage
            initialName={user?.name ?? ""}
            initialEmail={user?.email ?? ""}
            twoFactorEnabled={(user as any)?.twoFactorEnabled ?? false}
        />
    );
}
