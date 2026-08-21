"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, articles, moderationLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { createNotification } from "@/lib/notifications/service";
import { EmailService } from "@/lib/email/service";
import { hasCapability, parseScopes, type Capability, type Role } from "@/lib/auth/roles";
import { publishArticleToSanity, unpublishArticleFromSanity } from "@/lib/sanity/syncArticle";

async function requireModerator() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");
    const role = (session.user as any).role as string;
    if (!["Moderator", "SuperAdmin"].includes(role)) throw new Error("FORBIDDEN");
    return session.user;
}

async function requireModeratorWithCapability(cap: Capability) {
    const user = await requireModerator();
    const role = (user as { role?: string }).role as Role | undefined;
    const scopeString = (user as { moderationScope?: string }).moderationScope;
    const scopes = parseScopes(scopeString);
    if (!role || !hasCapability(role, scopes, cap)) {
        throw new Error(`FORBIDDEN:${cap}`);
    }
    return user;
}

// ── User Approval ─────────────────────────────────────────────────────────────

export async function approveUser(userId: string) {
    const mod = await requireModerator();

    const targetUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    await db.update(users)
        .set({ isApproved: true, status: "active" })
        .where(eq(users.id, userId));

    await db.insert(moderationLog).values({
        moderatorId: mod.id,
        actionType: "user_approved",
        targetId: userId,
        targetType: "user",
    });

    createNotification(userId, "user_approved", {
        title: "Account Approved",
        body: "Your Jenga365 account has been approved. You can now access your dashboard.",
        link: "/dashboard",
    }).catch(() => {});

    if (targetUser?.email) {
        const firstName = targetUser.name ? targetUser.name.split(" ")[0] : targetUser.email.split("@")[0];
        const baseUrl = process.env.BETTER_AUTH_URL || "https://jenga365.org";
        try {
            if (targetUser.role === "Mentor") {
                await EmailService.sendMentorApproved(targetUser.email, firstName, targetUser.email);
            } else if (targetUser.role === "CorporatePartner") {
                await EmailService.sendCorporateApproved(targetUser.email, firstName, "Corporate Partner");
            } else {
                await EmailService.sendRoleUpdated(targetUser.email, firstName, targetUser.role, `${baseUrl}/dashboard`);
            }
        } catch (emailErr) {
            console.error(`[approveUser] Failed to send approval email to ${targetUser.email}:`, emailErr);
        }
    }

    return { success: true };
}

export async function rejectUser(userId: string, reason?: string) {
    const mod = await requireModerator();

    const targetUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    await db.update(users)
        .set({ isApproved: false, status: "pending", rejectionReason: reason ?? null })
        .where(eq(users.id, userId));

    await db.insert(moderationLog).values({
        moderatorId: mod.id,
        actionType: "user_rejected",
        targetId: userId,
        targetType: "user",
        notes: reason,
    });

    createNotification(userId, "user_rejected", {
        title: "Account Not Approved",
        body: reason ?? "Your application was not approved at this time. Please contact support for more information.",
        link: "/pending-approval",
    }).catch(() => {});

    if (targetUser?.email) {
        const firstName = targetUser.name ? targetUser.name.split(" ")[0] : targetUser.email.split("@")[0];
        const reapplyDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        try {
            await EmailService.sendMentorRejected(targetUser.email, firstName, reason || "Application not approved at this time", reapplyDate);
        } catch (emailErr) {
            console.error(`[rejectUser] Failed to send rejection email to ${targetUser.email}:`, emailErr);
        }
    }

    return { success: true };
}

export async function suspendUser(userId: string) {
    const mod = await requireModerator();

    await db.update(users)
        .set({ isApproved: false, status: "suspended" })
        .where(eq(users.id, userId));

    await db.insert(moderationLog).values({
        moderatorId: mod.id,
        actionType: "user_suspended",
        targetId: userId,
        targetType: "user",
    });

    createNotification(userId, "general", {
        title: "Account Suspended",
        body: "Your Jenga365 account has been suspended. Please contact support for assistance.",
        link: "/contact",
    }).catch(() => {});

    return { success: true };
}

// ── Article Moderation ────────────────────────────────────────────────────────

export async function approveArticle(articleId: string) {
    // Phase 2.6 / CLAUDE.md: approval atomically publishes. Gate the publish-side
    // capability separately so Sanity Studio publishes (when wired up to call this
    // action) fail closed without the content scope.
    const mod = await requireModeratorWithCapability("PUBLISH_ARTICLE");

    const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
    });
    if (!article) throw new Error("Article not found");

    const publishedAt = new Date();
    await db.update(articles)
        .set({ status: "published", approvedBy: mod.id, publishedAt })
        .where(eq(articles.id, articleId));

    // Mirror to Sanity so the public /articles/[slug] route can render it.
    // Failure here doesn't roll back the Neon flip — log + alert the moderator.
    let sanityDocId: string | null = null;
    try {
        sanityDocId = await publishArticleToSanity(articleId);
    } catch (err) {
        console.error("[approveArticle] Sanity sync failed", { articleId, err });
    }

    await db.insert(moderationLog).values({
        moderatorId: mod.id,
        actionType: "article_approved",
        targetId: articleId,
        targetType: "article",
        notes: sanityDocId ? `Mirrored to Sanity (${sanityDocId})` : "Sanity mirror failed — manual repair required",
    });

    const audience = [article.authorId, ...(article.coAuthorIds ?? [])].filter(
        (id, idx, arr) => id && arr.indexOf(id) === idx,
    );
    for (const recipientId of audience) {
        createNotification(recipientId, "article_approved", {
            title: "Article Published",
            body: recipientId === article.authorId
                ? `Your article "${article.title}" has been approved and is now live.`
                : `An article you co-authored, "${article.title}", is now live.`,
            link: `/articles/${article.slug}`,
        }).catch(() => {});
    }

    return { success: true, sanityDocId };
}

export async function rejectArticle(articleId: string, feedback?: string) {
    const mod = await requireModeratorWithCapability("APPROVE_ARTICLE");

    const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
    });
    if (!article) throw new Error("Article not found");

    const wasPublished = article.status === "published";

    await db.update(articles)
        .set({
            status: "rejected",
            moderatorId: mod.id,
            rejectionFeedback: feedback ?? null,
        })
        .where(eq(articles.id, articleId));

    // If we previously mirrored to Sanity, pull it back so the public route 404s
    // instead of continuing to serve a now-rejected article.
    if (wasPublished || article.sanityDocId) {
        await unpublishArticleFromSanity(articleId).catch((err) => {
            console.error("[rejectArticle] Sanity unpublish failed", { articleId, err });
        });
    }

    await db.insert(moderationLog).values({
        moderatorId: mod.id,
        actionType: "article_rejected",
        targetId: articleId,
        targetType: "article",
        notes: feedback,
    });

    const audience = [article.authorId, ...(article.coAuthorIds ?? [])].filter(
        (id, idx, arr) => id && arr.indexOf(id) === idx,
    );
    for (const recipientId of audience) {
        createNotification(recipientId, "article_rejected", {
            title: "Article Needs Revision",
            body: feedback ?? `An article you co-authored requires changes before publishing.`,
            link: "/dashboard/articles",
        }).catch(() => {});
    }

    return { success: true };
}
