"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import ArticleEditor from "./ArticleEditor";
import {
    createArticleDraft,
    updateArticleDraft,
    submitArticleForReview,
    uploadArticleCoverImage,
    uploadArticleInlineImage,
    type ArticleCategory,
} from "@/lib/actions/articleAuthoring";
import type { UserSearchResult } from "@/lib/actions/userSearch";

interface EditorData {
    title: string;
    content: string;
    category: string;
    tags: string[];
    excerpt: string;
    coverImageUrl: string;
    coverImageAlt: string;
    coAuthorEmails: string[];
    isFeatured: boolean;
}

interface ArticleEditorClientProps {
    readonly mode: "new" | "edit";
    readonly initialData?: {
        id?: string;
        title?: string;
        content?: string;
        category?: string;
        tags?: string[];
        excerpt?: string;
        coverImageUrl?: string;
        coverImageAlt?: string;
        coAuthorEmails?: string[];
        initialCoAuthors?: UserSearchResult[];
        isFeatured?: boolean;
    };
    readonly canFeature?: boolean;
}

function toInput(data: EditorData) {
    return {
        title: data.title.trim(),
        excerpt: data.excerpt.trim(),
        body: data.content,
        category: data.category as ArticleCategory,
        tags: data.tags,
        coverImageUrl: data.coverImageUrl || null,
        coverImageAlt: data.coverImageAlt || null,
        coAuthorEmails: data.coAuthorEmails,
        isFeatured: data.isFeatured,
    };
}

export default function ArticleEditorClient({ mode, initialData, canFeature = false }: ArticleEditorClientProps) {
    const router = useRouter();
    const [pending, start] = useTransition();

    const handleSave = (data: EditorData) => {
        start(async () => {
            try {
                if (mode === "new") {
                    const result = await createArticleDraft(toInput(data));
                    router.push(`/dashboard/articles/${result.id}/edit`);
                } else if (initialData?.id) {
                    await updateArticleDraft(initialData.id, toInput(data));
                }
            } catch (err) {
                alert(err instanceof Error ? err.message : "Save failed");
            }
        });
    };

    const handleSubmit = (data: EditorData) => {
        start(async () => {
            try {
                let articleId = initialData?.id;
                if (mode === "new") {
                    const result = await createArticleDraft(toInput(data));
                    articleId = result.id;
                } else if (articleId) {
                    await updateArticleDraft(articleId, toInput(data));
                }
                if (articleId) {
                    await submitArticleForReview(articleId);
                    router.push("/dashboard/articles");
                }
            } catch (err) {
                alert(err instanceof Error ? err.message : "Submit failed");
            }
        });
    };

    return (
        <>
            {pending && (
                <div
                    className="fixed top-3 right-3 z-50 rounded-md border border-border bg-background px-3 py-1.5 text-eyebrow text-foreground-muted"
                    style={{ boxShadow: "var(--shadow-sm)" }}
                >
                    Saving…
                </div>
            )}
            <ArticleEditor
                initialData={initialData}
                onSave={handleSave}
                onSubmit={handleSubmit}
                onUploadCover={uploadArticleCoverImage}
                onUploadInlineImage={uploadArticleInlineImage}
                canFeature={canFeature}
            />
        </>
    );
}
