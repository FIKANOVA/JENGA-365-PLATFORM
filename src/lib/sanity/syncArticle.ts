import "server-only";
import { eq, inArray } from "drizzle-orm";
import { sanityWriteClient } from "./writeClient";
import { authorDocIdFor, ensureAuthorDoc } from "./ensureAuthor";
import { db } from "@/lib/db";
import { articles, users } from "@/lib/db/schema";
import { sanityImageRefFromUrl } from "./imageRef";

export function articleDocIdFor(neonArticleId: string): string {
    return `article-jenga-${neonArticleId}`;
}

interface PortableTextBlock {
    _type: string;
    _key?: string;
    [k: string]: unknown;
}

function ensureKeyed(blocks: unknown): PortableTextBlock[] {
    if (!Array.isArray(blocks)) return [];
    return (blocks as PortableTextBlock[]).map((block, i) => {
        const next: PortableTextBlock = { ...block, _key: block._key ?? `b-${i}` };
        const maybeChildren = (block as { children?: unknown }).children;
        if (Array.isArray(maybeChildren)) {
            next.children = (maybeChildren as Array<Record<string, unknown>>).map((c, j) => ({
                ...c,
                _key: (c._key as string | undefined) ?? `s-${i}-${j}`,
            }));
        }
        return next;
    });
}

// Mirror a Neon `articles` row into a Sanity `article` document. Idempotent:
// uses a deterministic _id, so re-running this on the same article overwrites
// the Sanity doc with the latest Neon content. Returns the Sanity doc id.
export async function publishArticleToSanity(neonArticleId: string): Promise<string> {
    const article = await db.query.articles.findFirst({
        where: eq(articles.id, neonArticleId),
    });
    if (!article) throw new Error(`Neon article ${neonArticleId} not found`);

    const author = await db.query.users.findFirst({
        where: eq(users.id, article.authorId),
        columns: { id: true, name: true, email: true, image: true, metadata: true },
    });
    if (!author) throw new Error(`Neon user ${article.authorId} (author) not found`);

    const authorMeta = (author.metadata as { bio?: string; professionalTitle?: string } | null) ?? null;
    await ensureAuthorDoc({
        userId: author.id,
        name: author.name,
        email: author.email,
        bio: authorMeta?.bio ?? null,
        role: authorMeta?.professionalTitle ?? null,
    });

    // Co-author docs: ensure one author doc per Neon user, build references.
    const coAuthorIds = (article.coAuthorIds ?? []).filter(Boolean);
    const coAuthorRefs: Array<{ _type: "reference"; _ref: string; _key: string }> = [];
    if (coAuthorIds.length > 0) {
        const coAuthorRows = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                metadata: users.metadata,
            })
            .from(users)
            .where(inArray(users.id, coAuthorIds));
        for (const co of coAuthorRows) {
            const meta = (co.metadata as { bio?: string; professionalTitle?: string } | null) ?? null;
            await ensureAuthorDoc({
                userId: co.id,
                name: co.name,
                email: co.email,
                bio: meta?.bio ?? null,
                role: meta?.professionalTitle ?? null,
            });
            coAuthorRefs.push({
                _type: "reference",
                _ref: authorDocIdFor(co.id),
                _key: `co-${co.id.slice(0, 8)}`,
            });
        }
    }

    const sanityId = articleDocIdFor(article.id);
    const imageRef = sanityImageRefFromUrl(article.coverImageUrl);
    const mainImage = imageRef
        ? {
              _type: "image",
              asset: { _type: "reference", _ref: imageRef },
              alt: article.coverImageAlt ?? "",
          }
        : undefined;

    await sanityWriteClient.createOrReplace({
        _id: sanityId,
        _type: "article",
        title: article.title,
        slug: { _type: "slug", current: article.slug },
        excerpt: article.excerpt ?? "",
        body: ensureKeyed(article.bodyPortableText),
        category: article.category ? article.category.toUpperCase() : "MENTORSHIP",
        tags: article.tags ?? [],
        author: { _type: "reference", _ref: authorDocIdFor(author.id) },
        ...(coAuthorRefs.length > 0 ? { coAuthors: coAuthorRefs } : {}),
        publishedAt: (article.publishedAt ?? new Date()).toISOString(),
        status: "published",
        isFeatured: article.isFeatured ?? false,
        ...(mainImage ? { mainImage } : {}),
    });

    if (article.sanityDocId !== sanityId) {
        await db
            .update(articles)
            .set({ sanityDocId: sanityId })
            .where(eq(articles.id, article.id));
    }

    return sanityId;
}

export async function unpublishArticleFromSanity(neonArticleId: string): Promise<void> {
    const sanityId = articleDocIdFor(neonArticleId);
    await sanityWriteClient.delete(sanityId).catch((err) => {
        // 404 is fine; nothing to unpublish.
        if (!String(err?.message ?? "").toLowerCase().includes("not found")) throw err;
    });
}
