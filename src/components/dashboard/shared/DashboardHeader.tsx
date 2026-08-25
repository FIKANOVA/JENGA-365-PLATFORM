"use client";

import Link from "next/link";
import { Home, Menu, PanelLeftClose, PanelLeftOpen, LayoutDashboard } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { useDashboardNav } from "../DashboardNavContext";

interface DashboardHeaderProps {
    role?: string;
}

export default function DashboardHeader({ role }: DashboardHeaderProps) {
    const { toggleMobile, isCollapsed, toggleCollapsed } = useDashboardNav();

    return (
        <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 bg-background/95 backdrop-blur-md shrink-0 sticky top-0 z-20">
            {/* Left side: Mobile menu toggle + Brand, or Desktop Sidebar Toggle */}
            <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={toggleMobile}
                    className="md:hidden p-2 rounded-lg border border-border text-foreground hover:bg-[color:var(--surface-2)] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                    aria-label="Toggle navigation menu"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Mobile Brand Mark */}
                <div className="md:hidden flex items-center gap-2 min-w-0">
                    <div
                        className="p-1 rounded-md shrink-0"
                        style={{ background: "var(--brand-green-soft)", color: "var(--brand-green)" }}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-foreground truncate">Jenga365</span>
                    {role && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[color:var(--surface-2)] text-foreground-muted uppercase tracking-wider font-semibold">
                            {role === "CorporatePartner" ? "Partner" : role}
                        </span>
                    )}
                </div>

                {/* Desktop Collapse Toggle */}
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    className="hidden md:flex items-center gap-1.5 p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-[color:var(--surface-2)] transition-colors"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <PanelLeftOpen className="w-5 h-5" />
                    ) : (
                        <PanelLeftClose className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Right side: Back to site + Notifications */}
            <div className="flex items-center gap-3 shrink-0">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs md:text-sm text-foreground-muted hover:text-foreground hover:bg-[color:var(--surface-2)] px-2.5 py-1.5 rounded-md transition-colors"
                >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Back to site</span>
                </Link>
                <NotificationBell />
            </div>
        </header>
    );
}
