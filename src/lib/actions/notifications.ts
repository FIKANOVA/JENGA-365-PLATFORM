"use server"

import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import {
    getUnreadNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "@/lib/notifications/service";

export async function getNotificationsAction() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return [];
    return getUnreadNotifications(session.user.id, 10);
}

export async function getUnreadCountAction(): Promise<number> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return 0;
    return getUnreadCount(session.user.id);
}

export async function markNotificationReadAction(notificationId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");
    await markAsRead(notificationId, session.user.id);
    return { success: true };
}

export async function markAllNotificationsReadAction() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");
    await markAllAsRead(session.user.id);
    return { success: true };
}
