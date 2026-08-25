import { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { getPublicProfileById } from "@/lib/db/queries/users";
import RenderedProfileView from "@/components/profile/RenderedProfileView";
import { UserX, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const profile = await getPublicProfileById(id);
    if (!profile) {
        return {
            title: "Profile Not Found | Jenga365",
            description: "The requested user profile could not be found.",
        };
    }

    return {
        title: `${profile.name || "Member"} (${profile.role}) | Jenga365`,
        description: profile.bio || `${profile.name}'s profile on Jenga365.`,
    };
}

export default async function UserProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [profile, session] = await Promise.all([
        getPublicProfileById(id),
        auth.api.getSession({ headers: await headers() }).catch(() => null),
    ]);

    if (!profile) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mb-4 text-foreground-muted">
                    <UserX className="w-8 h-8" />
                </div>
                <h1 className="text-display-sm text-foreground mb-2">Profile Not Found</h1>
                <p className="text-body-sm text-foreground-muted max-w-md mb-6">
                    This user profile does not exist or may not be publicly visible yet.
                </p>
                <div className="flex items-center gap-3">
                    <Link
                        href="/mentors"
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-md text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-green)" }}
                    >
                        Browse Mentors
                    </Link>
                    <Link
                        href="/mentees"
                        className="inline-flex items-center gap-2 h-10 px-5 rounded-md text-xs font-semibold border border-border bg-background hover:bg-[color:var(--surface-2)] text-foreground transition-colors"
                    >
                        Browse Mentees
                    </Link>
                </div>
            </div>
        );
    }

    const isOwner = session?.user?.id === profile.id;

    return (
        <main className="min-h-screen bg-background py-8">
            <RenderedProfileView profile={profile} isOwner={isOwner} />
        </main>
    );
}
