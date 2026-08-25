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
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return [];
        return await getUnreadNotifications(session.user.id, 10);
    } catch (e) {
        console.error("[getNotificationsAction] Failed:", e);
        return [];
    }
}

export async function getUnreadCountAction(): Promise<number> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return 0;
        return await getUnreadCount(session.user.id);
    } catch (e) {
        console.error("[getUnreadCountAction] Failed:", e);
        return 0;
    }
}

export async function markNotificationReadAction(notificationId: string) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };
        await markAsRead(notificationId, session.user.id);
        return { success: true };
    } catch (e) {
        console.error("[markNotificationReadAction] Failed:", e);
        return { success: false, error: "Failed to mark as read" };
    }
}

export async function markAllNotificationsReadAction() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) return { success: false, error: "UNAUTHORIZED" };
        await markAllAsRead(session.user.id);
        return { success: true };
    } catch (e) {
        console.error("[markAllNotificationsReadAction] Failed:", e);
        return { success: false, error: "Failed to mark all as read" };
    }
}
