import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import ArticleEditorClient from "@/components/dashboard/articles/ArticleEditorClient";
import { hydrateCoAuthors } from "@/lib/actions/userSearch";
import { portableToMarkdown } from "@/lib/sanity/markdownPortable";

export const dynamic = "force-dynamic";

function refToUrl(ref: string): string | null {
    const m = ref.match(/^image-(.+)-(\w+)$/);
    if (!m) return null;
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "dummy";
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
    if (!projectId) return null;
    return `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}.${m[2]}`;
}

export default async function EditArticlePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) redirect(`/login?next=/dashboard/articles/${id}/edit`);

    const article = await db.query.articles.findFirst({
        where: and(eq(articles.id, id), isNull(articles.deletedAt)),
    });
    if (!article) notFound();

    const role = (session.user as { role?: string }).role;
    const owns = article.authorId === session.user.id;
    const canEdit = owns || role === "SuperAdmin" || role === "Moderator";
    const canFeature = role === "SuperAdmin" || role === "Moderator";
    if (!canEdit) redirect("/dashboard/articles");

    // Hydrate saved co-author UUIDs into full user objects for the picker.
    const coAuthorIds = (article.coAuthorIds ?? []).filter(Boolean);
    const initialCoAuthors = coAuthorIds.length > 0
        ? await hydrateCoAuthors(coAuthorIds)
        : [];

    return (
        <ArticleEditorClient
            mode="edit"
            canFeature={canFeature}
            initialData={{
                id: article.id,
                title: article.title,
                content: portableToMarkdown(article.bodyPortableText, refToUrl),
                category: article.category ?? "Mentorship",
                tags: article.tags ?? [],
                excerpt: article.excerpt ?? "",
                coverImageUrl: article.coverImageUrl ?? "",
                coverImageAlt: article.coverImageAlt ?? "",
                initialCoAuthors,
                isFeatured: article.isFeatured ?? false,
            }}
        />
    );
}
