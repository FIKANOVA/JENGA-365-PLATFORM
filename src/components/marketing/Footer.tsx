"use client";

import Link from "next/link";
import { Linkedin, Mail, Globe, ArrowRight, Instagram, Twitter } from "lucide-react";
import Logo from "@/components/shared/Logo";

// Footer nav carries only wayfinding links. Donate / Store / Join are global
// header CTAs and appear in the final CTA strip directly above the footer, so
// they are intentionally NOT repeated here (avoids the "double footer" echo).
const footerNav = [
    {
        title: "Platform",
        links: [
            { label: "About Us", href: "/about" },
            { label: "Impact", href: "/impact" },
            { label: "Help & Support", href: "/help" },
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
            { label: "Become a Partner", href: "/register/partner" },
            { label: "Events", href: "/events" },
            { label: "Contact", href: "/contact" },
        ],
    },
];

const socials = [
    { icon: Linkedin, href: "https://www.linkedin.com/company/jenga-ccclxv/posts/?feedView=all", label: "LinkedIn" },
    { icon: Instagram, href: "https://www.instagram.com/jengaccclxv/", label: "Instagram" },
    { icon: Twitter, href: "https://x.com/jengaccclxv", label: "X" },
    { icon: Mail, href: "mailto:info@jenga365.org", label: "Email" },
];

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/10 relative overflow-hidden">
            {/* Subtle red glow */}
            <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-primary opacity-[0.04] blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
                {/* Top section */}
                <div className="grid grid-cols-2 md:grid-cols-12 gap-12 md:gap-16 py-14 border-b border-white/5">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-4 space-y-6 md:space-y-8">
                        <Link href="/">
                            <Logo asLink={false} tone="light" size="lg" />
                        </Link>
                        <p className="font-sans text-sm text-white/40 leading-relaxed max-w-xs hidden md:block">
                            Kenya&apos;s dual-engine AI platform, building the Total Athlete through mentorship, financial literacy, and environmental stewardship.
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
                        <div key={col.title} className="col-span-1 md:col-span-2 space-y-6">
                            <h4 className="text-[9px] text-white/25 font-bold">
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
                    <div className="col-span-2 md:col-span-2 space-y-6">
                        <h4 className="text-[9px] text-white/25 font-bold">
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
                            <button className="flex items-center gap-2 text-[9px] text-white/50 hover:text-white transition-colors font-bold group">
                                Subscribe
                                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-8">
                        <span className="text-[9px] text-white/20">
                            © {new Date().getFullYear()} Jenga365
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[9px] text-white/30">Live</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <Link href="/privacy" className="text-[9px] text-white/20 hover:text-white/60 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-[9px] text-white/20 hover:text-white/60 transition-colors">
                            Terms
                        </Link>
                        <span className="hidden md:inline font-sans text-[11px] text-white/15 italic">Nairobi, Kenya</span>
                    </div>
                </div>

                {/* Developer Credit Bar */}
                <div className="py-4 border-t border-white/5 flex justify-center items-center">
                    <span className="font-sans text-[11px] text-white/20">
                        Site by{" "}
                        <a
                            href="https://fikanova.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/35 hover:text-white/70 transition-colors underline underline-offset-2"
                        >
                            Fikanova
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
