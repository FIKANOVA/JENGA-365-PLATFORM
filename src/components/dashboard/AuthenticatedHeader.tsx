"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserAvatar from "@/components/shared/UserAvatar";
import Logo from "@/components/shared/Logo";
import NotificationBell from "@/components/shared/NotificationBell";
import { cn } from "@/lib/utils";

const ROLE_NAV: Record<string, { label: string, href: string }[]> = {
    Mentor: [
        { label: "About", href: "/about" },
        { label: "Mentors", href: "/mentors" },
        { label: "Mentees", href: "/mentees" },
        { label: "Resources", href: "/resources" },
        { label: "Events", href: "/events" },
        { label: "Impact", href: "/impact" },
        { label: "Contact", href: "/contact" },
        { label: "Store", href: "/shop" },
    ],
    Mentee: [
        { label: "About", href: "/about" },
        { label: "Mentors", href: "/mentors" },
        { label: "Mentees", href: "/mentees" },
        { label: "Resources", href: "/resources" },
        { label: "Events", href: "/events" },
        { label: "Impact", href: "/impact" },
        { label: "Contact", href: "/contact" },
        { label: "Store", href: "/shop" },
    ],
};

interface AuthenticatedHeaderProps {
    userRole?: string;
    userName?: string;
    isOnboarded?: boolean;
}

export default function AuthenticatedHeader({
    userRole = "Mentee",
    userName = "Jenga User",
}: AuthenticatedHeaderProps) {
    const pathname = usePathname();
    const menuItems = ROLE_NAV[userRole] || ROLE_NAV["Mentee"];

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 h-20 transition-all duration-300">
            <nav className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
                        <Logo variant="symbol" showText theme="premium" height={32} />
                    </Link>
                    
                    {/* Role Badge */}
                    <div 
                        className={cn(
                            "hidden sm:flex items-center px-3 py-1 border rounded-md font-mono text-[9px] uppercase tracking-[0.1em]",
                            userRole === "Mentor" && "bg-[var(--red-tint)] text-[var(--red)] border-[rgba(187,0,0,0.2)]",
                            userRole === "Mentee" && "bg-[var(--green-tint)] text-[var(--green)] border-[rgba(0,102,0,0.2)]",
                            userRole === "Corporate" && "bg-[#F5F5F5] text-black border-[var(--border-strong)]",
                            userRole === "Moderator" && "bg-[var(--red-tint)] text-[#990000] border-[rgba(153,0,0,0.2)]",
                            userRole === "Admin" && "bg-black text-white border-black"
                        )}
                    >
                        {userRole} Role
                    </div>
                </div>

                {/* Navigation */}
                <div className="hidden lg:flex items-center gap-1">
                    {menuItems.map((link) => (
                        <Link 
                            key={link.href} 
                            href={link.href}
                            className={`font-mono text-[10px] uppercase tracking-[0.15em] px-3 py-2 transition-colors ${
                                pathname === link.href ? "text-primary" : "text-slate-600 dark:text-slate-400 hover:text-primary"
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4">
                        <Link 
                            href="/dashboard"
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-lg shadow-slate-900/10"
                        >
                            Dashboard
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-4 ml-2 pl-4 border-l border-slate-100 dark:border-slate-800">
                        <NotificationBell />

                        <Link 
                            href="/profile"
                            className="flex items-center justify-center h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-primary transition-colors"
                        >
                            <UserAvatar name={userName} />
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}
