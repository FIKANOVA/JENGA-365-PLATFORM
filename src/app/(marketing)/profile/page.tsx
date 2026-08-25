import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyProfileRedirectPage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }

    if (!session?.user?.id) {
        redirect("/login?next=/profile");
    }

    redirect(`/profile/${session.user.id}`);
}
