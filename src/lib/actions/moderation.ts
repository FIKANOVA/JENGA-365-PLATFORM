"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, articles, moderationLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { createNotification } from "@/lib/notifications/service";
import { hasCapability, parseScopes, type Capability, type Role } from "@/lib/auth/roles";

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

    return { success: true };
}

export async function rejectUser(userId: string, reason?: string) {
    const mod = await requireModerator();

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

    await db.update(articles)
        .set({ status: "published", approvedBy: mod.id, publishedAt: new Date() })
        .where(eq(articles.id, articleId));

    await db.insert(moderationLog).values({
        moderatorId: mod.id,
        actionType: "article_approved",
        targetId: articleId,
        targetType: "article",
    });

    createNotification(article.authorId, "article_approved", {
        title: "Article Published",
        body: `Your article "${article.title}" has been approved and is now live.`,
        link: `/articles/${article.slug}`,
    }).catch(() => {});

    return { success: true };
}

export async function rejectArticle(articleId: string, feedback?: string) {
    const mod = await requireModeratorWithCapability("APPROVE_ARTICLE");

    const article = await db.query.articles.findFirst({
        where: eq(articles.id, articleId),
    });
    if (!article) throw new Error("Article not found");

    await db.update(articles)
        .set({
            status: "rejected",
            moderatorId: mod.id,
            rejectionFeedback: feedback ?? null,
        })
        .where(eq(articles.id, articleId));

    await db.insert(moderationLog).values({
        moderatorId: mod.id,
        actionType: "article_rejected",
        targetId: articleId,
        targetType: "article",
        notes: feedback,
    });

    createNotification(article.authorId, "article_rejected", {
        title: "Article Needs Revision",
        body: feedback ?? `Your article "${article.title}" requires changes before publishing.`,
        link: "/dashboard/mentor",
    }).catch(() => {});

    return { success: true };
}
