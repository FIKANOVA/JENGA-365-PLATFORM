"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
    getNotificationsAction,
    markNotificationReadAction,
    markAllNotificationsReadAction,
} from "@/lib/actions/notifications";

type Notification = {
    id: string;
    type: string;
    title: string;
    body: string;
    link: string | null;
    readAt: Date | null;
    createdAt: Date;
};

const POLL_INTERVAL = 30_000; // 30 seconds

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await getNotificationsAction();
            setNotifications(data as Notification[]);
        } catch {
            // Silently fail — user may not be authenticated yet
        }
    }, []);

    // Initial fetch + polling
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleMarkRead(id: string) {
        await markNotificationReadAction(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }

    async function handleMarkAllRead() {
        await markAllNotificationsReadAction();
        setNotifications([]);
    }

    const unreadCount = notifications.length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((v) => !v)}
                className="relative p-2 text-slate-400 hover:text-primary transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white border-2 border-white dark:border-slate-900">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
                            Notifications
                        </span>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-primary hover:underline font-mono"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground font-mono">
                                No new notifications
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{n.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                                        <p className="text-[10px] font-mono text-muted-foreground mt-1">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                        {n.link && (
                                            <Link
                                                href={n.link}
                                                onClick={() => { handleMarkRead(n.id); setOpen(false); }}
                                                className="p-1 text-slate-400 hover:text-primary transition-colors"
                                                aria-label="View"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleMarkRead(n.id)}
                                            className="p-1 text-slate-400 hover:text-primary transition-colors"
                                            aria-label="Dismiss"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
