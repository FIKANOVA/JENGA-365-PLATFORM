"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Check, Loader2 } from "lucide-react";
import {
    getNotificationsAction,
    markAllNotificationsReadAction,
    markNotificationReadAction,
} from "@/lib/actions/notifications";

interface Notif {
    id: string;
    type: string;
    title: string;
    body: string;
    link: string | null;
    createdAt: string | Date;
}

function timeAgo(iso: string | Date): string {
    const now = Date.now();
    const t = new Date(iso).getTime();
    const s = Math.max(0, Math.round((now - t) / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.round(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.round(h / 24);
    return `${d}d`;
}

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<Notif[]>([]);
    const [loading, setLoading] = useState(false);
    const [pending, start] = useTransition();
    const ref = useRef<HTMLDivElement>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const rows = await getNotificationsAction();
            setItems(rows as unknown as Notif[]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 60_000);
        return () => clearInterval(interval);
    }, [refresh]);

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [open]);

    const handleMarkOne = (id: string) => {
        start(async () => {
            await markNotificationReadAction(id);
            setItems((prev) => prev.filter((n) => n.id !== id));
        });
    };

    const handleMarkAll = () => {
        start(async () => {
            await markAllNotificationsReadAction();
            setItems([]);
        });
    };

    const unreadCount = items.length;

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="relative text-foreground-muted hover:text-foreground transition-colors"
                aria-label="Notifications"
                aria-expanded={open}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-mono font-bold text-white flex items-center justify-center border-2 border-background"
                        style={{ background: "var(--brand-red)" }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className="absolute right-0 mt-2 w-[360px] max-h-[480px] overflow-hidden rounded-lg border border-border bg-background flex flex-col z-50"
                    style={{ boxShadow: "var(--shadow-md, var(--shadow-sm))" }}
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <p className="text-label text-foreground font-medium">Notifications</p>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAll}
                                disabled={pending}
                                className="text-eyebrow text-foreground-muted hover:text-foreground disabled:opacity-50"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-4 h-4 animate-spin text-foreground-muted" />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <Bell className="w-8 h-8 mx-auto text-foreground-subtle mb-3" />
                                <p className="text-body-sm text-foreground-muted">You're all caught up.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-border">
                                {items.map((n) => {
                                    const inner = (
                                        <div className="flex-1 min-w-0">
                                            <p className="text-label text-foreground font-medium truncate">{n.title}</p>
                                            <p className="text-body-sm text-foreground-muted line-clamp-2 mt-0.5">{n.body}</p>
                                            <p className="text-eyebrow text-foreground-subtle mt-1">{timeAgo(n.createdAt)} ago</p>
                                        </div>
                                    );
                                    return (
                                        <li key={n.id} className="px-4 py-3 hover:bg-[color:var(--surface-1)] transition-colors">
                                            <div className="flex items-start gap-3">
                                                {n.link ? (
                                                    <Link
                                                        href={n.link}
                                                        onClick={() => { handleMarkOne(n.id); setOpen(false); }}
                                                        className="flex-1 min-w-0"
                                                    >
                                                        {inner}
                                                    </Link>
                                                ) : (
                                                    inner
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => handleMarkOne(n.id)}
                                                    disabled={pending}
                                                    className="shrink-0 p-1.5 rounded-md text-foreground-subtle hover:text-foreground hover:bg-[color:var(--surface-2)] transition-colors disabled:opacity-50"
                                                    aria-label="Mark as read"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
