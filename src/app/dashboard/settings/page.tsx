import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import SettingsPage from "@/components/dashboard/SettingsPage";

export const metadata: Metadata = {
    title: "Account Settings | Jenga365",
    description: "Manage your Jenga365 profile and account security.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardSettingsPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login");

    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    }).catch(() => null);

    const meta = (dbUser?.metadata || {}) as Record<string, any>;

    return (
        <SettingsPage
            userId={session.user.id}
            role={dbUser?.role ?? (session.user as any)?.role ?? "Mentee"}
            initialName={dbUser?.name ?? session.user.name ?? ""}
            initialEmail={dbUser?.email ?? session.user.email ?? ""}
            initialImage={dbUser?.image ?? session.user.image ?? null}
            initialLocationRegion={dbUser?.locationRegion ?? ""}
            initialProfession={meta.profession || meta.professionalTitle || ""}
            initialBio={meta.bio || ""}
            initialLinkedIn={meta.linkedIn || ""}
            initialX={meta.x || meta.twitter || ""}
            initialInstagram={meta.instagram || ""}
            initialYoutube={meta.youtube || ""}
            initialTiktok={meta.tiktok || ""}
            initialWebsite={meta.website || ""}
            twoFactorEnabled={dbUser?.twoFactorEnabled ?? false}
        />
    );
}
