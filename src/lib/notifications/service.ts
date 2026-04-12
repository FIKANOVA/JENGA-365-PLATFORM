import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { and, eq, isNull, desc, sql } from "drizzle-orm";

export type NotificationType =
    | "nda_signed"
    | "user_approved"
    | "user_rejected"
    | "new_match"
    | "match_accepted"
    | "match_declined"
    | "payment_success"
    | "session_reminder"
    | "article_approved"
    | "article_rejected"
    | "general";

export async function createNotification(
    userId: string,
    type: NotificationType,
    data: { title: string; body: string; link?: string }
) {
    await db.insert(notifications).values({
        userId,
        type,
        title: data.title,
        body: data.body,
        link: data.link,
    });
}

export async function getUnreadNotifications(userId: string, limit = 20) {
    return db.select()
        .from(notifications)
        .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
}

export async function getUnreadCount(userId: string): Promise<number> {
    const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    return result[0]?.count ?? 0;
}

export async function markAsRead(notificationId: string, userId: string) {
    await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllAsRead(userId: string) {
    await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
}
