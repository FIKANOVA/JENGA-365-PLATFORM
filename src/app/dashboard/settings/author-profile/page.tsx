import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getAuthorProfile } from "@/lib/actions/authorProfile";
import AuthorProfileForm from "@/components/dashboard/AuthorProfileForm";

export const dynamic = "force-dynamic";

export default async function AuthorProfilePage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login?next=/dashboard/settings/author-profile");

    const profile = await getAuthorProfile();

    return (
        <div className="flex-1 p-8 lg:p-12 bg-background min-h-screen">
            <div className="max-w-2xl mx-auto space-y-8">
                <header className="space-y-2 border-b border-border pb-6">
                    <h1 className="text-display-md text-foreground">Author profile</h1>
                    <p className="text-body-sm text-foreground-muted">
                        How you appear on articles you've written. Updates flow to Sanity within seconds.
                    </p>
                </header>
                <AuthorProfileForm
                    initialBio={profile.bio}
                    initialTitle={profile.professionalTitle}
                />
            </div>
        </div>
    );
}
