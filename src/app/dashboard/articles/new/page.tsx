import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import ArticleEditorClient from "@/components/dashboard/articles/ArticleEditorClient";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect("/login?next=/dashboard/articles/new");
    const role = (session.user as { role?: string }).role;
    const canFeature = role === "SuperAdmin" || role === "Moderator";
    return <ArticleEditorClient mode="new" canFeature={canFeature} />;
}
