"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function DashboardHeader() {
    return (
        <header className="flex items-center justify-end gap-4 border-b border-border px-8 py-4 bg-background shrink-0">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-body-sm text-foreground-muted hover:text-foreground transition-colors"
            >
                <Home className="w-4 h-4" />
                Back to site
            </Link>
            <NotificationBell />
        </header>
    );
}
