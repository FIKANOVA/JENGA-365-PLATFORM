import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";
import AboutCTAStrip from "@/components/marketing/about/AboutCTAStrip";

export const metadata = {
    title: "Voices | Jenga365",
    description: "Real stories from mentors, mentees, and community members in the Jenga365 network.",
};

export default function VoicesPage() {
    return (
        <div className="flex flex-col" style={{ background: "var(--surface-1)" }}>
            <section className="border-b border-border pt-32 pb-24" style={{ background: "var(--surface-1)" }}>
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="max-w-3xl space-y-6">
                        <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            Stories
                        </span>
                        <h1 className="text-display-xl text-foreground">
                            Community voices.
                        </h1>
                        <p className="text-body-lg text-foreground-muted leading-relaxed max-w-2xl">
                            Hear from the mentors, mentees, and partners who are shaping the Jenga365 story — one conversation at a time.
                        </p>
                        <Link
                            href="/articles"
                            className="inline-flex items-center gap-2 h-11 rounded-md px-5 text-label font-medium transition-opacity hover:opacity-90"
                            style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                        >
                            Read articles <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
                    <Mic className="h-16 w-16 text-foreground-subtle mx-auto mb-6" />
                    <h2 className="text-display-md text-foreground mb-3">Stories coming soon</h2>
                    <p className="text-body-lg text-foreground-muted max-w-md mx-auto">
                        We&apos;re gathering stories from our community. Check back soon or explore our articles in the meantime.
                    </p>
                </div>
            </section>

            <AboutCTAStrip />
        </div>
    );
}
