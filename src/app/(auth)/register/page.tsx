"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/shared/Logo";

const ROLES = [
    {
        id: "mentee",
        name: "Mentee",
        icon: "school",
        tagline: "Athletes & young professionals",
        description: "Get matched with experienced mentors, access exclusive resources, and grow through structured community engagement.",
        benefits: [
            "Professional mentorship matching",
            "Resource library & courses",
            "Community events & clinics",
            "AI-powered growth profile",
        ],
        badge: "Instant Access",
        badgeClass: "text-primary border-primary/40",
        accentBar: "bg-primary",
        cta: "Join as Mentee",
        ctaClass: "btn-primary w-full shadow-lg",
    },
    {
        id: "mentor",
        name: "Mentor",
        icon: "psychology",
        tagline: "Experienced professionals",
        description: "Share your expertise, guide emerging leaders, and access exclusive founder circles and strategic networks.",
        benefits: [
            "Guide one mentee per month",
            "Strategic network access",
            "Impact tracking dashboard",
            "Exclusive founder circles",
        ],
        badge: "Requires Approval",
        badgeClass: "text-amber-600 border-amber-400/40",
        accentBar: "bg-amber-500",
        cta: "Apply as Mentor",
        ctaClass: "w-full py-4 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-primary transition-all shadow-lg",
    },
    {
        id: "corporate",
        name: "Corporate",
        icon: "business",
        tagline: "Organisations & businesses",
        description: "Integrate CSR impact, sponsor talent pipelines, and access aggregated performance metrics across the Jenga365 network.",
        benefits: [
            "CSR impact integration",
            "Talent pipeline visibility",
            "Partnership performance reports",
            "Aggregated impact metrics",
        ],
        badge: "Requires Approval",
        badgeClass: "text-amber-600 border-amber-400/40",
        accentBar: "bg-foreground",
        cta: "Partner With Us",
        ctaClass: "w-full py-4 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-primary transition-all shadow-lg",
    },
];

export default function RegisterHubPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
            {/* Background watermark */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none flex items-center justify-center">
                <span className="font-serif font-bold text-[35vw] text-foreground/[0.015] leading-none tracking-tighter uppercase whitespace-nowrap">
                    365
                </span>
            </div>

            {/* Header with logo + step label */}
            <header className="w-full border-b border-border py-6 px-6 md:px-12 flex items-center justify-between relative z-10 bg-background/95 backdrop-blur-md sticky top-0">
                <Link href="/">
                    <Logo variant="premium" height={40} priority />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="h-px w-6 bg-primary" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Step 1 of 3</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center py-16 px-6 relative z-10">
                <div className="max-w-6xl w-full space-y-14">
                    {/* Heading */}
                    <div className="text-center space-y-5 max-w-2xl mx-auto">
                        <div className="flex items-center justify-center gap-4">
                            <span className="h-px w-8 bg-primary" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Choose your role</span>
                            <span className="h-px w-8 bg-primary" />
                        </div>
                        <h1 className="font-serif font-black text-5xl md:text-6xl text-foreground uppercase tracking-tighter leading-[0.92]">
                            How will you<br />
                            <span className="text-primary italic">contribute?</span>
                        </h1>
                        <p className="font-sans font-light text-lg text-muted-foreground leading-relaxed">
                            Join the Jenga365 ecosystem. Each path is built for impact — at every level.
                        </p>
                    </div>

                    {/* Uniform Role Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {ROLES.map((role) => (
                            <div
                                key={role.id}
                                className="jenga-card group relative flex flex-col p-10 space-y-8 overflow-hidden hover:border-primary/50 transition-colors"
                            >
                                {/* Top accent bar */}
                                <div className={`absolute top-0 left-0 w-full h-1 ${role.accentBar} group-hover:h-[3px] transition-all duration-300`} />

                                {/* Header */}
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <span className="material-symbols-outlined text-4xl text-muted-foreground group-hover:text-primary transition-colors">
                                            {role.icon}
                                        </span>
                                        <span className={`font-mono text-[8px] uppercase tracking-widest font-bold border px-2 py-1 ${role.badgeClass}`}>
                                            {role.badge}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-black text-3xl text-foreground uppercase tracking-tight">
                                            {role.name}
                                        </h3>
                                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold mt-1">
                                            {role.tagline}
                                        </p>
                                    </div>
                                    <p className="font-sans font-light text-sm text-muted-foreground leading-relaxed">
                                        {role.description}
                                    </p>
                                </div>

                                {/* Benefits */}
                                <ul className="space-y-3 flex-1">
                                    {role.benefits.map((benefit) => (
                                        <li key={benefit} className="flex gap-3 items-start">
                                            <span className="material-symbols-outlined text-sm text-primary mt-0.5">adjust</span>
                                            <span className="font-sans font-light text-sm text-muted-foreground leading-snug">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => router.push(`/register/${role.id}`)}
                                    className={role.ctaClass}
                                >
                                    {role.cta}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Login link */}
                    <div className="text-center pt-6 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="font-bold text-primary hover:underline transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
