"use client";

import { MessageSquare, Search } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function DashboardHeader() {
    return (
        <header className="flex items-center justify-between border-b border-border px-8 py-4 bg-background shrink-0">
            <div className="flex-1 max-w-md">
                <label
                    className="flex items-center rounded-md px-3 py-2 w-full focus-within:ring-2 focus-within:ring-[color:var(--brand-green-soft)] focus-within:bg-background transition-all"
                    style={{ background: "var(--surface-1)" }}
                >
                    <Search className="text-foreground-subtle mr-2 w-4 h-4" />
                    <input
                        type="text"
                        className="bg-transparent border-none focus:ring-0 text-body-sm w-full text-foreground placeholder:text-foreground-subtle outline-none"
                        placeholder="Search mentors, resources…"
                    />
                </label>
            </div>
            <div className="flex items-center gap-4">
                <NotificationBell />
                <button
                    className="inline-flex items-center gap-2 h-9 rounded-md px-4 text-label font-medium transition-opacity hover:opacity-90"
                    style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                >
                    <MessageSquare className="w-4 h-4" />
                    Messages
                </button>
            </div>
        </header>
    );
}
