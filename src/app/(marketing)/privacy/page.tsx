import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { fetchLegalPageBySlug } from "@/lib/sanity/queries";
import PageHero from "@/components/shared/PageHero";
import { components } from "@/lib/sanity/portableTextComponents";

export const metadata: Metadata = {
    title: "Privacy Policy | Jenga365",
    description: "Jenga365 Privacy Policy",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
    const page = await fetchLegalPageBySlug("privacy");

    if (!page) {
        return (
            <main className="flex-1 bg-background">
                <PageHero
                    heading="Privacy Policy"
                    description="How Jenga365 collects, uses, and safeguards your personal and organizational data."
                />
                <section className="py-16 md:py-24">
                    <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-8 text-foreground-muted text-body leading-relaxed">
                        <div className="space-y-3">
                            <h2 className="text-display-xs text-foreground font-semibold">1. Overview and Scope</h2>
                            <p>
                                Jenga365 is committed to protecting your privacy. This Privacy Policy describes how we collect, use, process, and disclose your information across our website, mentorship matching platform, environmental tracking tools, and related services.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-display-xs text-foreground font-semibold">2. Information We Collect</h2>
                            <p>
                                We collect information you provide directly (such as name, email, athletic background, professional experience, and profile details during onboarding), verification data for mentors and mentees, as well as data submitted during tree survival audits, session logs, and CSR partnerships.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-display-xs text-foreground font-semibold">3. How We Use Information</h2>
                            <p>
                                We use your information to facilitate mentorship matches using our AI matching system, track environmental stewardship progress (tree survival and give-back milestones), verify mentor credentials, process payments and donations via Paystack, and generate aggregated impact reports.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-display-xs text-foreground font-semibold">4. Data Sharing and Protection</h2>
                            <p>
                                We do not sell your personal data. We only share information with authorized third-party service providers (such as payment gateways and communication infrastructure) necessary to operate the platform, in compliance with applicable data protection laws.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-display-xs text-foreground font-semibold">5. Contact Us</h2>
                            <p>
                                If you have questions regarding this Privacy Policy or wish to exercise your data subject rights, please contact us at <a href="mailto:privacy@jenga365.org" className="text-foreground underline">privacy@jenga365.org</a>.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="flex-1 bg-background">
            <PageHero
                heading={page.title}
                description={`Last updated: ${new Date(page.lastUpdated).toLocaleDateString()}`}
            />
            <section className="py-16 md:py-24">
                <div className="max-w-3xl mx-auto px-6 lg:px-8 prose prose-invert">
                    <PortableText value={page.body} components={components} />
                </div>
            </section>
        </main>
    );
}
