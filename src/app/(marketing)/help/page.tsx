import Link from "next/link";
import {
    Search,
    BookOpen,
    Users,
    ShieldCheck,
    MessageCircle,
    Mail,
    ArrowRight,
} from "lucide-react";
import FAQSection from "@/components/marketing/FAQSection";

export const metadata = {
    title: "Help Center | Jenga365",
    description: "Get support and find answers to common questions about Jenga365.",
};

const MANUAL_CARDS = [
    {
        title: "General user manual",
        body: "Everything you need as a mentee or mentor — profile setup, messaging, and course access.",
        Icon: BookOpen,
        badge: null,
    },
    {
        title: "Collaborator manual",
        body: "Guides for corporate partners and moderators — managing programs and content compliance.",
        Icon: Users,
        badge: { label: "Restricted", tone: "muted" as const },
    },
    {
        title: "SuperAdmin manual",
        body: "Internal operations, database management, and platform-wide configuration for IT staff.",
        Icon: ShieldCheck,
        badge: { label: "Confidential", tone: "brand" as const },
    },
];

const POPULAR_TOPICS = [
    { title: "How to find a mentor", desc: "Step-by-step guide to finding the right match for your career." },
    { title: "Approving articles", desc: "For moderators: the standard checklist for content quality." },
    { title: "KYC verification", desc: "Understanding the identification process for mentors." },
    { title: "Setting up payments", desc: "Connect your local bank account or mobile wallet." },
    { title: "Live sessions guide", desc: "How to use the built-in video conferencing tool." },
    { title: "Reporting harassment", desc: "Safety first — how to report inappropriate behavior." },
    { title: "Certificates & badges", desc: "Earning and sharing your accomplishments." },
    { title: "Account deletion", desc: "Data privacy and permanent account removal." },
];

export default function HelpPage() {
    return (
        <main className="bg-background">
            {/* Hero */}
            <section className="bg-hero-radial border-b border-border">
                <div className="mx-auto max-w-3xl px-6 lg:px-8 py-20 lg:py-28 text-center space-y-8">
                    <div className="space-y-3">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            Help center
                        </p>
                        <h1 className="text-display-lg text-foreground">
                            How can we help you today?
                        </h1>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                        <input
                            type="text"
                            className="h-12 w-full rounded-md border border-border bg-background pl-11 pr-4 text-body text-foreground placeholder:text-foreground-subtle transition-colors focus:border-[color:var(--brand-green)] focus:outline-none"
                            placeholder="Search documentation, tutorials, or FAQs…"
                        />
                    </div>
                    <p className="text-body-sm text-foreground-muted">
                        Popular: mentor onboarding · article approval · profile verification
                    </p>
                </div>
            </section>

            {/* Manuals */}
            <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {MANUAL_CARDS.map(({ title, body, Icon, badge }) => (
                        <div
                            key={title}
                            className="rounded-lg border border-border bg-background p-6 lg:p-8 flex flex-col group hover:border-[color:var(--border-strong,#D4D4D8)] transition-colors"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                        >
                            <div className="flex items-start justify-between">
                                <span
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md"
                                    style={{ background: "var(--surface-2)" }}
                                >
                                    <Icon className="h-5 w-5 text-foreground" />
                                </span>
                                {badge && (
                                    <span
                                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium"
                                        style={
                                            badge.tone === "brand"
                                                ? {
                                                      background: "var(--brand-green-soft)",
                                                      color: "var(--brand-green)",
                                                  }
                                                : {
                                                      background: "var(--surface-2)",
                                                      color: "var(--foreground-muted)",
                                                  }
                                        }
                                    >
                                        {badge.label}
                                    </span>
                                )}
                            </div>
                            <h3 className="mt-5 text-headline text-foreground">{title}</h3>
                            <p className="mt-3 text-body-sm text-foreground-muted flex-1">
                                {body}
                            </p>
                            <button
                                className="mt-6 inline-flex items-center gap-1.5 text-label font-medium self-start hover:underline"
                                style={{ color: "var(--brand-green)" }}
                            >
                                Read manual <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Popular topics */}
            <section
                className="border-y border-border"
                style={{ background: "var(--surface-1)" }}
            >
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-20">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
                        <div className="space-y-2">
                            <p
                                className="text-eyebrow"
                                style={{ color: "var(--brand-green)" }}
                            >
                                Knowledge base
                            </p>
                            <h2 className="text-display-md text-foreground">
                                Popular topics
                            </h2>
                        </div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-label hover:underline"
                            style={{ color: "var(--brand-green)" }}
                        >
                            View all topics <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {POPULAR_TOPICS.map((topic) => (
                            <Link
                                key={topic.title}
                                href="/"
                                className="block rounded-lg border border-border bg-background p-5 hover:border-[color:var(--border-strong,#D4D4D8)] transition-colors group"
                                style={{ boxShadow: "var(--shadow-sm)" }}
                            >
                                <h4 className="text-title text-foreground group-hover:text-foreground">
                                    {topic.title}
                                </h4>
                                <p className="mt-2 text-body-sm text-foreground-muted">
                                    {topic.desc}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <FAQSection />

            {/* Support CTA */}
            <section className="mx-auto max-w-7xl px-6 lg:px-8 py-16 lg:py-24">
                <div
                    className="rounded-lg border border-border p-10 lg:p-14 text-center"
                    style={{ background: "var(--foreground)" }}
                >
                    <div className="max-w-2xl mx-auto space-y-5">
                        <p
                            className="text-eyebrow"
                            style={{ color: "var(--brand-green)" }}
                        >
                            Still stuck?
                        </p>
                        <h2 className="text-display-sm" style={{ color: "var(--background)" }}>
                            We&apos;re here to help
                        </h2>
                        <p
                            className="text-body"
                            style={{ color: "color-mix(in srgb, var(--background) 70%, transparent)" }}
                        >
                            Our support team is available 24/7 for technical issues and
                            platform inquiries.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                            <button
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-label font-medium text-white transition-opacity hover:opacity-90"
                                style={{ background: "var(--brand-green)" }}
                            >
                                <MessageCircle className="h-4 w-4" /> Start live chat
                            </button>
                            <Link
                                href="/contact"
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border px-5 text-label font-medium transition-colors"
                                style={{
                                    borderColor: "color-mix(in srgb, var(--background) 25%, transparent)",
                                    color: "var(--background)",
                                }}
                            >
                                <Mail className="h-4 w-4" /> Email support
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
