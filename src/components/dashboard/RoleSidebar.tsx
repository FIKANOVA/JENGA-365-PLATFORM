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
} from "lucide-react";
import { signOut } from "@/lib/auth/client";

const ROLE_DASHBOARD: Record<string, string> = {
    Mentee: "/dashboard/mentee",
    Mentor: "/dashboard/mentor",
    CorporatePartner: "/dashboard/partner",
    NGO: "/dashboard/ngo",
    Moderator: "/dashboard/moderator",
    SuperAdmin: "/dashboard/admin",
};

const ROLE_STUDIO: Record<string, string> = {
    Mentee: "/dashboard/mentee/studio",
    Mentor: "/dashboard/mentor/studio",
    CorporatePartner: "/dashboard/partner/studio",
    NGO: "/dashboard/ngo/studio",
    Moderator: "/dashboard/moderator/studio",
    SuperAdmin: "/dashboard/admin/studio",
};

export default function RoleSidebar({ role }: { role: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const dashboardHref = ROLE_DASHBOARD[role] ?? "/dashboard";
    const studioHref = ROLE_STUDIO[role] ?? "/dashboard/admin/studio";

    const links = [
        { href: dashboardHref, label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/pathway", label: "My Pathway", icon: Route, roles: ["Mentee"] },
        {
            href: role === "Mentor" ? "/dashboard/mentor/mentees" : "/dashboard/people",
            label: role === "Mentor" ? "Mentees" : "Mentors",
            icon: Users,
            roles: ["Mentee", "Mentor"],
        },
        { href: "/dashboard/content", label: "Resources", icon: LibraryBig },
        { href: "/dashboard/journal", label: "Journal", icon: BookOpen, roles: ["Mentee"] },
        { href: "/dashboard/ngo/mou", label: "MOU Agreement", icon: FileText, roles: ["NGO"] },
        { href: "/dashboard/stats", label: "Impact Stats", icon: BarChart3, roles: ["Mentor", "CorporatePartner", "NGO", "SuperAdmin"] },
        { href: "/dashboard/profile", label: "AI Interview", icon: BrainCircuit, roles: ["Mentee", "Mentor", "CorporatePartner", "NGO"] },
        // ── Content Studio (all roles — article creation & editing)
        { href: studioHref, label: "Content Studio", icon: PenSquare },
        // ── Admin & Moderator tools
        { href: "/events", label: "Events", icon: CalendarDays, roles: ["SuperAdmin", "Moderator"] },
        { href: "/dashboard/moderator/inventory", label: "Shop Inventory", icon: Package, roles: ["SuperAdmin", "Moderator"] },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ].filter(link => !link.roles || link.roles.includes(role));

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <aside className="w-64 bg-kenya-black text-white flex flex-col h-full shrink-0 min-h-screen font-display">
            <div className="p-6 flex items-center gap-3">
                <div className="text-kenya-red p-1 bg-white/5 rounded-md">
                    <LayoutDashboard className="w-6 h-6" />
                </div>
                <h1 className="font-playfair text-2xl font-bold tracking-wider">Jenga365</h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 font-mono text-sm">
                {links.map((link) => {
                    const active = isActive(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded transition-colors border-l-2 ${
                                active
                                    ? "bg-white/10 text-white border-l-[var(--primary-green)]"
                                    : "text-gray-300 border-l-transparent hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <link.icon className={`w-5 h-5 ${active ? "text-[var(--primary-green)]" : "text-gray-400"}`} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted/20 relative overflow-hidden shrink-0 border border-white/20 flex items-center justify-center">
                        <span className="font-serif font-bold text-sm text-white/60">{role.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-lato font-bold text-sm text-white truncate">My Account</p>
                        <p className="font-mono text-xs text-gray-400 truncate">
                            {role === "NGO" ? "NGO Partner" : role}
                        </p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
