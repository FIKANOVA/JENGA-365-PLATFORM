"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Settings,
    BarChart3,
    LogOut,
    Route,
    LibraryBig,
    BookOpen,
    BrainCircuit,
    PenSquare,
    CalendarDays,
    Package,
    FileText,
    Mail,
    Unlock,
    ShieldAlert,
    PanelLeftClose,
    PanelLeftOpen,
    X,
} from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { useDashboardNav } from "./DashboardNavContext";

const ROLE_DASHBOARD: Record<string, string> = {
    Mentee: "/dashboard/mentee",
    Mentor: "/dashboard/mentor",
    CorporatePartner: "/dashboard/partner",
    NGO: "/dashboard/ngo",
    Moderator: "/dashboard/moderator",
    SuperAdmin: "/dashboard/admin",
};

const STUDIO_HREF = "/studio";

interface RoleSidebarProps {
    role: string;
}

export default function RoleSidebar({ role }: RoleSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useDashboardNav();

    const dashboardHref = ROLE_DASHBOARD[role] ?? "/dashboard";
    const studioHref = STUDIO_HREF;

    const links = [
        { href: dashboardHref, label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/pathway", label: "My pathway", icon: Route, roles: ["Mentee"] },
        {
            href: role === "Mentor" ? "/dashboard/mentor/mentees" : "/dashboard/people",
            label: role === "Mentor" ? "Mentees" : "Mentors",
            icon: Users,
            roles: ["Mentee", "Mentor"],
        },
        { href: "/dashboard/people", label: "User directory", icon: Users, roles: ["Moderator"] },
        { href: "/dashboard/content", label: "Content", icon: LibraryBig },
        { href: "/dashboard/journal", label: "Journal", icon: BookOpen, roles: ["Mentee"] },
        { href: "/dashboard/ngo/mou", label: "MOU agreement", icon: FileText, roles: ["NGO"] },
        { href: "/dashboard/stats", label: "Impact stats", icon: BarChart3, roles: ["Mentor", "CorporatePartner", "NGO", "SuperAdmin"] },
        { href: "/dashboard/profile", label: "AI interview", icon: BrainCircuit, roles: ["Mentee", "Mentor", "CorporatePartner", "NGO"] },
        { href: "/dashboard/articles", label: "My articles", icon: PenSquare, roles: ["Mentor", "Mentee"] },
        { href: studioHref, label: "Sanity Studio", icon: PenSquare, roles: ["SuperAdmin", "Moderator", "CorporatePartner", "NGO"], external: true },
        { href: "/events", label: "Events", icon: CalendarDays, roles: ["SuperAdmin", "Moderator"] },
        { href: "/dashboard/moderator/inventory", label: "Shop inventory", icon: Package, roles: ["SuperAdmin", "Moderator"] },
        { href: "/dashboard/admin/corporate-invite", label: "Corporate invite", icon: Mail, roles: ["SuperAdmin"] },
        { href: "/dashboard/admin/esg-unlock", label: "ESG unlock", icon: Unlock, roles: ["SuperAdmin"] },
        { href: "/dashboard/admin/cosign", label: "Suspension co-sign", icon: ShieldAlert, roles: ["SuperAdmin"] },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ].filter(link => !link.roles || link.roles.includes(role));

    const isActive = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <>
            {/* ── Desktop Collapsible Sidebar (md:flex) ── */}
            <aside
                className={`hidden md:flex flex-col h-screen shrink-0 sticky top-0 z-30 transition-all duration-300 ease-in-out border-r border-white/10 ${
                    isCollapsed ? "w-[72px]" : "w-64"
                }`}
                style={{ background: "#0a0a0a", color: "#ffffff" }}
                aria-label="Desktop sidebar"
            >
                {/* Header / Logo + Collapse Toggle */}
                <div className={`p-4 flex items-center border-b border-white/10 ${isCollapsed ? "justify-center" : "justify-between"}`}>
                    <Link
                        href={dashboardHref}
                        className="flex items-center gap-3 min-w-0 transition-opacity hover:opacity-90"
                        title="Jenga365 Dashboard"
                    >
                        <div
                            className="p-2 rounded-lg shrink-0 flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.08)", color: "var(--brand-green)" }}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <span className="font-bold text-base tracking-tight block text-white">Jenga365</span>
                                <span className="text-[11px] text-white/50 block truncate font-medium uppercase tracking-wider">
                                    {role === "CorporatePartner" ? "Partner" : role}
                                </span>
                            </div>
                        )}
                    </Link>

                    {!isCollapsed && (
                        <button
                            type="button"
                            onClick={toggleCollapsed}
                            className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            title="Collapse sidebar"
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeftClose className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Collapsed Toggle Button when in compact mode */}
                {isCollapsed && (
                    <div className="pt-2 px-2 flex justify-center">
                        <button
                            type="button"
                            onClick={toggleCollapsed}
                            className="p-2 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            title="Expand sidebar"
                            aria-label="Expand sidebar"
                        >
                            <PanelLeftOpen className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 min-h-0 overflow-y-auto px-2.5 py-4 space-y-1.5 scrollbar-thin">
                    {links.map((link) => {
                        const active = !link.external && isActive(link.href);
                        const Icon = link.icon;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                target={link.external ? "_blank" : undefined}
                                rel={link.external ? "noopener noreferrer" : undefined}
                                title={isCollapsed ? link.label : undefined}
                                className={`flex items-center gap-3 rounded-lg transition-all text-sm font-medium ${
                                    isCollapsed ? "justify-center px-2 py-3" : "px-3 py-2.5"
                                } ${
                                    active
                                        ? "bg-white/10 text-white font-semibold shadow-sm"
                                        : "text-white/70 hover:text-white hover:bg-white/5"
                                }`}
                                style={
                                    active
                                        ? { borderLeft: isCollapsed ? "none" : "3px solid var(--brand-green)" }
                                        : undefined
                                }
                            >
                                <Icon
                                    className={`shrink-0 transition-transform ${isCollapsed ? "w-5 h-5" : "w-4 h-4"} ${
                                        active ? "text-[var(--brand-green)]" : "text-white/60"
                                    }`}
                                />
                                {!isCollapsed && (
                                    <span className="truncate">{link.label}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User / Sign Out Footer */}
                <div className="p-3 border-t border-white/10">
                    <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
                        <div
                            className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/20 flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.1)" }}
                            title={`${role} Account`}
                        >
                            <span className="text-xs font-bold text-white/90">{role.charAt(0)}</span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">My Account</p>
                                <p className="text-[11px] text-white/50 truncate">
                                    {role === "NGO" ? "NGO Partner" : role}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={handleSignOut}
                            className={`p-2 rounded-lg transition-colors text-white/60 hover:text-white hover:bg-white/10 ${
                                isCollapsed ? "mt-1" : ""
                            }`}
                            title="Sign out"
                            aria-label="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Mobile Slide-Over Drawer (md:hidden) ── */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-50 flex"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation drawer"
                >
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                        onClick={closeMobile}
                        aria-hidden="true"
                    />

                    {/* Drawer Content */}
                    <div
                        className="relative z-50 w-[290px] max-w-[85vw] h-full flex flex-col border-r border-white/10 shadow-2xl transition-transform animate-in slide-in-from-left duration-300 ease-out"
                        style={{ background: "#0a0a0a", color: "#ffffff" }}
                    >
                        {/* Drawer Header */}
                        <div className="p-4 flex items-center justify-between border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-lg shrink-0 flex items-center justify-center"
                                    style={{ background: "rgba(255,255,255,0.08)", color: "var(--brand-green)" }}
                                >
                                    <LayoutDashboard className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="font-bold text-base tracking-tight block text-white">Jenga365</span>
                                    <span className="text-[11px] text-white/50 block font-medium uppercase tracking-wider">
                                        {role === "CorporatePartner" ? "Partner" : role}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closeMobile}
                                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Close navigation"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drawer Navigation */}
                        <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1.5">
                            {links.map((link) => {
                                const active = !link.external && isActive(link.href);
                                const Icon = link.icon;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={closeMobile}
                                        target={link.external ? "_blank" : undefined}
                                        rel={link.external ? "noopener noreferrer" : undefined}
                                        className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-colors text-sm font-medium min-h-[44px] ${
                                            active
                                                ? "bg-white/10 text-white font-semibold shadow-sm border-l-4 border-[var(--brand-green)]"
                                                : "text-white/75 hover:text-white hover:bg-white/5 border-l-4 border-transparent"
                                        }`}
                                    >
                                        <Icon
                                            className={`w-5 h-5 shrink-0 ${
                                                active ? "text-[var(--brand-green)]" : "text-white/60"
                                            }`}
                                        />
                                        <span className="truncate">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Drawer User Footer */}
                        <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/20 flex items-center justify-center"
                                    style={{ background: "rgba(255,255,255,0.1)" }}
                                >
                                    <span className="text-sm font-bold text-white/90">{role.charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">My Account</p>
                                    <p className="text-xs text-white/50 truncate">
                                        {role === "NGO" ? "NGO Partner" : role}
                                    </p>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2.5 rounded-lg transition-colors text-white/70 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    title="Sign out"
                                    aria-label="Sign out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
