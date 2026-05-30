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

const STUDIO_HREF = "/studio";

export default function RoleSidebar({ role }: { role: string }) {
    const pathname = usePathname();
    const router = useRouter();
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

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <aside
            className="w-64 text-white flex flex-col h-screen shrink-0 sticky top-0"
            style={{ background: "#0a0a0a" }}
        >
            <div className="p-6 flex items-center gap-3 border-b border-white/10">
                <div
                    className="p-1.5 rounded-md"
                    style={{ background: "rgba(255,255,255,0.05)", color: "var(--brand-red)" }}
                >
                    <LayoutDashboard className="w-5 h-5" />
                </div>
                <h1 className="text-headline tracking-wide">Jenga365</h1>
            </div>

            <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1">
                {links.map((link) => {
                    const active = !link.external && isActive(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            target={link.external ? "_blank" : undefined}
                            rel={link.external ? "noopener noreferrer" : undefined}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-label"
                            style={
                                active
                                    ? { background: "rgba(255,255,255,0.08)", color: "#ffffff", borderLeft: "2px solid var(--brand-green)", paddingLeft: "calc(0.75rem - 2px)" }
                                    : { color: "rgba(255,255,255,0.65)", borderLeft: "2px solid transparent", paddingLeft: "calc(0.75rem - 2px)" }
                            }
                        >
                            <link.icon
                                className="w-4 h-4"
                                style={{ color: active ? "var(--brand-green)" : "rgba(255,255,255,0.55)" }}
                            />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/20 flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                        <span className="text-label text-white/70">{role.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-label text-white truncate">My account</p>
                        <p className="text-eyebrow truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
                            {role === "NGO" ? "NGO Partner" : role}
                        </p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="p-1.5 rounded-md transition-colors text-white/55 hover:text-white hover:bg-white/5"
                        title="Sign out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
