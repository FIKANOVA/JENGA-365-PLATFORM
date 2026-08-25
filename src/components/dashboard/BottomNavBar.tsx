"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Route,
    BrainCircuit,
    PenSquare,
    LibraryBig,
    FileText,
    Package,
    Mail,
    Menu,
} from "lucide-react";
import { useDashboardNav } from "./DashboardNavContext";

interface BottomNavProps {
    role: string;
}

export default function BottomNavBar({ role }: { role: string }) {
    const pathname = usePathname();
    const { toggleMobile, isMobileOpen } = useDashboardNav();

    const getRoleItems = (roleName: string) => {
        switch (roleName) {
            case "Mentor":
                return [
                    { href: "/dashboard/mentor", label: "Dashboard", icon: LayoutDashboard },
                    { href: "/dashboard/mentor/mentees", label: "Mentees", icon: Users },
                    { href: "/dashboard/articles", label: "Articles", icon: PenSquare },
                    { href: "/dashboard/stats", label: "Stats", icon: BarChart3 },
                ];
            case "CorporatePartner":
                return [
                    { href: "/dashboard/partner", label: "Dashboard", icon: LayoutDashboard },
                    { href: "/dashboard/people", label: "People", icon: Users },
                    { href: "/dashboard/stats", label: "Impact", icon: BarChart3 },
                    { href: "/dashboard/profile", label: "AI Profile", icon: BrainCircuit },
                ];
            case "NGO":
                return [
                    { href: "/dashboard/ngo", label: "Dashboard", icon: LayoutDashboard },
                    { href: "/dashboard/ngo/mou", label: "MOU", icon: FileText },
                    { href: "/dashboard/content", label: "Content", icon: LibraryBig },
                    { href: "/dashboard/stats", label: "Stats", icon: BarChart3 },
                ];
            case "Moderator":
                return [
                    { href: "/dashboard/moderator", label: "Dashboard", icon: LayoutDashboard },
                    { href: "/dashboard/people", label: "Directory", icon: Users },
                    { href: "/dashboard/content", label: "Content", icon: LibraryBig },
                    { href: "/dashboard/moderator/inventory", label: "Shop", icon: Package },
                ];
            case "SuperAdmin":
                return [
                    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
                    { href: "/dashboard/people", label: "Users", icon: Users },
                    { href: "/dashboard/admin/corporate-invite", label: "Invites", icon: Mail },
                    { href: "/dashboard/stats", label: "Stats", icon: BarChart3 },
                ];
            case "Mentee":
            default:
                return [
                    { href: "/dashboard/mentee", label: "Dashboard", icon: LayoutDashboard },
                    { href: "/dashboard/pathway", label: "Pathway", icon: Route },
                    { href: "/dashboard/people", label: "Mentors", icon: Users },
                    { href: "/dashboard/profile", label: "AI Profile", icon: BrainCircuit },
                ];
        }
    };

    const items = getRoleItems(role);

    const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

    return (
        <nav
            aria-label="Mobile bottom navigation"
            className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-background/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
            style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
        >
            <div className="flex items-center justify-around h-14 px-1">
                {items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors relative min-w-0 ${
                                active
                                    ? "text-[var(--brand-green)] font-semibold"
                                    : "text-foreground-muted hover:text-foreground font-normal"
                            }`}
                        >
                            <Icon className={`w-5 h-5 mb-0.5 transition-transform ${active ? "scale-110" : ""}`} />
                            <span className="text-[10px] leading-tight truncate px-1 max-w-full">
                                {item.label}
                            </span>
                            {active && (
                                <span
                                    className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--brand-green)]"
                                    aria-hidden="true"
                                />
                            )}
                        </Link>
                    );
                })}

                {/* More / Menu Drawer Trigger */}
                <button
                    type="button"
                    onClick={toggleMobile}
                    aria-label="Open full navigation menu"
                    aria-expanded={isMobileOpen}
                    className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors relative min-w-0 ${
                        isMobileOpen
                            ? "text-[var(--brand-green)] font-semibold"
                            : "text-foreground-muted hover:text-foreground font-normal"
                    }`}
                >
                    <Menu className={`w-5 h-5 mb-0.5 transition-transform ${isMobileOpen ? "scale-110" : ""}`} />
                    <span className="text-[10px] leading-tight truncate px-1 max-w-full">
                        Menu
                    </span>
                    {isMobileOpen && (
                        <span
                            className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--brand-green)]"
                            aria-hidden="true"
                        />
                    )}
                </button>
            </div>
        </nav>
    );
}
