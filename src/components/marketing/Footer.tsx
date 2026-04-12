"use client";

import Link from "next/link";
import { Linkedin, Mail, Globe, ArrowRight } from "lucide-react";
import Logo from "@/components/shared/Logo";

const footerNav = [
    {
        title: "Platform",
        links: [
            { label: "About Us", href: "/about" },
            { label: "Impact", href: "/impact" },
            { label: "Events", href: "/events" },
            { label: "Contact", href: "/contact" },
        ],
    },
    {
        title: "Community",
        links: [
            { label: "Mentors", href: "/mentors" },
            { label: "Mentees", href: "/mentees" },
            { label: "Articles", href: "/articles" },
            { label: "Resources", href: "/resources" },
        ],
    },
    {
        title: "Get Involved",
        links: [
            { label: "Join Free", href: "/register" },
            { label: "Donate", href: "/donate" },
            { label: "Shop", href: "/shop" },
            { label: "Become a Partner", href: "/register" },
        ],
    },
];

const socials = [
    { icon: Linkedin, href: "https://linkedin.com/company/jenga365", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hello@jenga365.com", label: "Email" },
    { icon: Globe, href: "https://jenga365.com", label: "Website" },
];

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/5 relative overflow-hidden">
            {/* Subtle red glow */}
            <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-primary opacity-[0.04] blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                {/* Top section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16 py-20 border-b border-white/5">
                    {/* Brand */}
                    <div className="md:col-span-4 space-y-8">
                        <Link href="/">
                            <Logo variant="white" theme="dark" height={40} />
                        </Link>
                        <p className="font-sans text-sm text-white/40 leading-relaxed max-w-xs">
                            Kenya&apos;s dual-engine AI platform — building the Total Athlete through mentorship, financial literacy, and environmental stewardship.
                        </p>
                        <div className="flex items-center gap-3">
                            {socials.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/40 transition-all duration-300"
                                >
                                    <Icon size={15} strokeWidth={1.5} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav columns */}
                    {footerNav.map((col) => (
                        <div key={col.title} className="md:col-span-2 space-y-6">
                            <h4 className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/25 font-bold">
                                {col.title}
                            </h4>
                            <ul className="space-y-4">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="font-sans text-sm text-white/50 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter */}
                    <div className="md:col-span-2 space-y-6">
                        <h4 className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/25 font-bold">
                            Jenga Journal
                        </h4>
                        <p className="font-sans text-sm text-white/40 leading-relaxed">
                            Monthly insights for mentors, mentees and partners.
                        </p>
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full bg-transparent border-b border-white/10 pb-3 text-sm font-sans text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                            />
                            <button className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors font-bold group">
                                Subscribe
                                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-8">
                        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/20">
                            © 2024 Jenga365
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">Live</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <Link href="/privacy" className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/20 hover:text-white/60 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/20 hover:text-white/60 transition-colors">
                            Terms
                        </Link>
                        <span className="font-sans text-[11px] text-white/15 italic">Nairobi, Kenya</span>
                        <span className="hidden md:inline font-sans text-[11px] text-white/20">
                            Site by{" "}
                            <a
                                href="https://www.fikanova.co.ke/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/35 hover:text-white/70 transition-colors"
                            >
                                Fikanova
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
