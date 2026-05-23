"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { articles, users, type articleCategoryEnum } from "@/lib/db/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { sanityWriteClient } from "@/lib/sanity/writeClient";
import { publishArticleToSanity } from "@/lib/sanity/syncArticle";
import { markdownToPortable } from "@/lib/sanity/markdownPortable";

export type ArticleCategory = (typeof articleCategoryEnum)["enumValues"][number];

export interface ArticleDraftInput {
    title: string;
    excerpt: string;
    body: string; // plain text; serialized into a single-block portable text array
    category: ArticleCategory;
    tags: string[];
    coverImageUrl?: string | null;
    coverImageAlt?: string | null;
    coAuthorEmails?: string[];
    isFeatured?: boolean; // privileged-only; ignored for non-mod authors
}

const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
]);
const MAX_IMAGE_BYTES = 7 * 1024 * 1024; // ~7MB; well under the 8mb action body limit

async function requireAuthor() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");
    const role = (session.user as { role?: string }).role;
    if (role !== "Mentor" && role !== "Mentee" && role !== "Moderator" && role !== "SuperAdmin") {
        throw new Error("FORBIDDEN");
    }
    return session.user;
}

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 96);
}

// Body parsing now lives in src/lib/sanity/markdownPortable.ts so the edit page
// can round-trip back to markdown.
const bodyToPortableText = markdownToPortable;

async function uniqueSlugFor(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title) || `article-${Date.now()}`;
    let candidate = base;
    let suffix = 1;
    while (true) {
        const existing = await db.query.articles.findFirst({
            where: eq(articles.slug, candidate),
            columns: { id: true },
        });
        if (!existing || existing.id === excludeId) return candidate;
        suffix += 1;
        candidate = `${base}-${suffix}`;
    }
}

function wordCount(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
}

async function resolveCoAuthorIds(
    emails: string[] | undefined,
    excludeUserId: string,
): Promise<string[]> {
    if (!emails || emails.length === 0) return [];
    const cleaned = Array.from(
        new Set(
            emails
                .map((e) => e.trim().toLowerCase())
                .filter((e) => e.length > 0 && e.includes("@")),
        ),
    );
    if (cleaned.length === 0) return [];
    const rows = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(inArray(users.email, cleaned));
    return rows.map((r) => r.id).filter((id) => id !== excludeUserId);
}

function readMinutes(text: string): number {
    return Math.max(1, Math.round(wordCount(text) / 220));
}

export async function createArticleDraft(input: ArticleDraftInput) {
    const user = await requireAuthor();
    const role = (user as { role?: string }).role;
    const isPrivileged = role === "SuperAdmin" || role === "Moderator";
    const slug = await uniqueSlugFor(input.title);
    const coAuthorIds = await resolveCoAuthorIds(input.coAuthorEmails, user.id);

    const [row] = await db
        .insert(articles)
        .values({
            authorId: user.id,
            title: input.title,
            slug,
            excerpt: input.excerpt || null,
            bodyPortableText: bodyToPortableText(input.body),
            category: input.category,
            tags: input.tags,
            status: "draft",
            wordCount: wordCount(input.body),
            readTimeMinutes: readMinutes(input.body),
            coverImageUrl: input.coverImageUrl || null,
            coverImageAlt: input.coverImageAlt || null,
            coAuthorIds: coAuthorIds.length > 0 ? coAuthorIds : null,
            isFeatured: isPrivileged ? !!input.isFeatured : false,
        })
        .returning({ id: articles.id });
    revalidatePath("/dashboard/articles");
    return { id: row.id, slug };
}

async function uploadImageToSanity(formData: FormData): Promise<{ url: string }> {
    await requireAuthor();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("No file uploaded");
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or AVIF.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
        throw new Error("Image exceeds 7MB limit");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await sanityWriteClient.assets.upload("image", buffer, {
        filename: file.name,
        contentType: file.type,
    });
    return { url: asset.url };
}

export async function uploadArticleCoverImage(formData: FormData): Promise<{ url: string }> {
    return uploadImageToSanity(formData);
}

export async function uploadArticleInlineImage(formData: FormData): Promise<{ url: string }> {
    return uploadImageToSanity(formData);
}

export async function updateArticleDraft(articleId: string, input: ArticleDraftInput) {
    const user = await requireAuthor();
    const role = (user as { role?: string }).role;
    const isPrivileged = role === "SuperAdmin" || role === "Moderator";
    const existing = await db.query.articles.findFirst({
        where: and(eq(articles.id, articleId), isNull(articles.deletedAt)),
    });
    if (!existing) throw new Error("Article not found");
    if (existing.authorId !== user.id && !isPrivileged) throw new Error("FORBIDDEN");
    // Only privileged roles can edit a published article — for Mentor/Mentee
    // the moderator queue is the place to revise post-publication.
    if (existing.status === "published" && !isPrivileged) {
        throw new Error("Cannot edit a published article — contact a moderator");
    }
    const wasPublished = existing.status === "published";

    const slug = input.title === existing.title
        ? existing.slug
        : await uniqueSlugFor(input.title, existing.id);

    const coAuthorIds = input.coAuthorEmails !== undefined
        ? await resolveCoAuthorIds(input.coAuthorEmails, user.id)
        : (existing.coAuthorIds ?? []);

    await db
        .update(articles)
        .set({
            title: input.title,
            slug,
            excerpt: input.excerpt || null,
            bodyPortableText: bodyToPortableText(input.body),
            category: input.category,
            tags: input.tags,
            wordCount: wordCount(input.body),
            readTimeMinutes: readMinutes(input.body),
            coverImageUrl: input.coverImageUrl ?? existing.coverImageUrl ?? null,
            coverImageAlt: input.coverImageAlt ?? existing.coverImageAlt ?? null,
            coAuthorIds: coAuthorIds.length > 0 ? coAuthorIds : null,
            isFeatured: isPrivileged ? !!input.isFeatured : existing.isFeatured,
            lastEditedAt: new Date(),
        })
        .where(eq(articles.id, articleId));

    // If a published article was just edited (moderator-side), push the new
    // content to Sanity so the public page reflects it. Best-effort — Neon
    // already has the edit.
    if (wasPublished) {
        try {
            await publishArticleToSanity(articleId);
        } catch (err) {
            console.error("[updateArticleDraft] Sanity re-sync failed", { articleId, err });
        }
    }

    revalidatePath("/dashboard/articles");
    revalidatePath(`/dashboard/articles/${articleId}/edit`);
    if (wasPublished && existing.slug) {
        revalidatePath(`/articles/${existing.slug}`);
    }
    return { id: articleId, slug };
}

export async function submitArticleForReview(articleId: string) {
    const user = await requireAuthor();
    const existing = await db.query.articles.findFirst({
        where: and(eq(articles.id, articleId), isNull(articles.deletedAt)),
    });
    if (!existing) throw new Error("Article not found");
    if (existing.authorId !== user.id) throw new Error("FORBIDDEN");
    if (existing.status !== "draft" && existing.status !== "rejected") {
        throw new Error(`Cannot submit from status ${existing.status}`);
    }
    if (!existing.coverImageUrl) {
        throw new Error("Add a cover image before submitting for review");
    }
    if (!existing.excerpt || existing.excerpt.trim().length < 20) {
        throw new Error("Add an excerpt (at least 20 characters) before submitting");
    }
    if ((existing.wordCount ?? 0) < 50) {
        throw new Error("Article body is too short — write at least 50 words before submitting");
    }

    await db
        .update(articles)
        .set({
            status: "in_review",
            submittedForReviewAt: new Date(),
            rejectionFeedback: null,
        })
        .where(eq(articles.id, articleId));
    revalidatePath("/dashboard/articles");
    return { ok: true };
}

export async function deleteArticleDraft(articleId: string) {
    const user = await requireAuthor();
    const existing = await db.query.articles.findFirst({
        where: and(eq(articles.id, articleId), isNull(articles.deletedAt)),
    });
    if (!existing) throw new Error("Article not found");
    if (existing.authorId !== user.id) {
        const role = (user as { role?: string }).role;
        if (role !== "SuperAdmin") throw new Error("FORBIDDEN");
    }
    if (existing.status === "published") {
        throw new Error("Cannot delete a published article from the author form");
    }
    await db
        .update(articles)
        .set({ deletedAt: new Date() })
        .where(eq(articles.id, articleId));
    revalidatePath("/dashboard/articles");
    return { ok: true };
}
