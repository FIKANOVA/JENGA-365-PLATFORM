"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { articles, moderationLog } from "@/lib/db/schema";
import { hasCapability, parseScopes, type Capability, type Role } from "@/lib/auth/roles";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { sanityWriteClient } from "@/lib/sanity/writeClient";

import { revalidatePath } from "next/cache";

async function requireCap(cap: Capability) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");
    const role = (session.user as { role?: string }).role as Role | undefined;
    const scopes = parseScopes((session.user as { moderationScope?: string }).moderationScope);
    if (!role || !hasCapability(role, scopes, cap)) {
        throw new Error(`FORBIDDEN:${cap}`);
    }
    return session.user;
}

function publishedIdFor(sanityDocId: string): string {
    return sanityDocId.replace(/^drafts\./, "");
}

// Move drafts.<id> → <id> in Sanity, mirror status to Neon (if a row exists),
// and write a moderation log entry. Capability-gated to PUBLISH_ARTICLE.
export async function publishArticleViaStudio(sanityDocId: string) {
    const actor = await requireCap("PUBLISH_ARTICLE");
    const publishedId = publishedIdFor(sanityDocId);
    const draftId = `drafts.${publishedId}`;

    const draft = await sanityWriteClient.getDocument(draftId);
    const published = await sanityWriteClient.getDocument(publishedId);

    if (!draft && !published) {
        throw new Error("Article document not found");
    }

    const nowIso = new Date().toISOString();

    // Promote the draft if one exists; otherwise just stamp the live doc as published.
    if (draft) {
        const finalPublishedAt = draft.publishedAt || nowIso;
        await sanityWriteClient
            .transaction()
            .createOrReplace({
                ...draft,
                _id: publishedId,
                status: "published",
                publishedAt: finalPublishedAt,
            })
            .delete(draftId)
            .commit({ visibility: "async" });
    } else if (published) {
        const finalPublishedAt = published.publishedAt || nowIso;
        await sanityWriteClient
            .patch(publishedId)
            .set({ status: "published", publishedAt: finalPublishedAt })
            .commit({ visibility: "async" });
    }

    // Mirror to Neon if a matching article row exists. Best-effort; not fatal if absent.
    const neonArticle = await db.query.articles.findFirst({
        where: eq(articles.sanityDocId, publishedId),
    });

    if (neonArticle) {
        await db.update(articles)
            .set({
                status: "published",
                approvedBy: actor.id,
                publishedAt: new Date(),
            })
            .where(eq(articles.id, neonArticle.id));

        await db.insert(moderationLog).values({
            moderatorId: actor.id,
            actionType: "article_approved",
            targetId: neonArticle.id,
            targetType: "article",
            notes: `Published via Studio (sanityId=${publishedId})`,
        });
    }

    revalidatePath("/resources/articles");
    revalidatePath("/articles");
    revalidatePath("/");

    return { ok: true, publishedId };
}

// Hard-delete both draft and published copies. Audit-logged. Capability-gated.
export async function deleteArticleViaStudio(sanityDocId: string) {
    const actor = await requireCap("APPROVE_ARTICLE");
    const publishedId = publishedIdFor(sanityDocId);
    const draftId = `drafts.${publishedId}`;

    const neonArticle = await db.query.articles.findFirst({
        where: eq(articles.sanityDocId, publishedId),
    });

    await sanityWriteClient
        .transaction()
        .delete(draftId)
        .delete(publishedId)
        .commit({ visibility: "async" })
        .catch((err) => {
            // Sanity may 404 if either doc is missing; that's OK.
            if (!String(err?.message ?? "").includes("not found")) throw err;
        });

    if (neonArticle) {
        await db.update(articles)
            .set({ deletedAt: new Date() })
            .where(eq(articles.id, neonArticle.id));

        await db.insert(moderationLog).values({
            moderatorId: actor.id,
            actionType: "article_rejected",
            targetId: neonArticle.id,
            targetType: "article",
            notes: `Deleted via Studio (sanityId=${publishedId})`,
        });
    }

    return { ok: true, deletedId: publishedId };
}
