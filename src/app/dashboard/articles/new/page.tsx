import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { normalizeRole } from "@/lib/auth/roles";
import ArticleEditorClient from "@/components/dashboard/articles/ArticleEditorClient";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
    let session = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch {
        // ignore
    }
    if (!session?.user) redirect("/login?next=/dashboard/articles/new");
    const role = normalizeRole((session.user as any)?.role);
    const canFeature = role === "SuperAdmin" || role === "Moderator";
    return <ArticleEditorClient mode="new" canFeature={canFeature} />;
}
