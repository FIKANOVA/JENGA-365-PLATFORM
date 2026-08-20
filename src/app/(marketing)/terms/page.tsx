import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { fetchLegalPageBySlug } from "@/lib/sanity/queries";
import PageHero from "@/components/shared/PageHero";
import { components } from "@/lib/sanity/portableTextComponents";

export const metadata: Metadata = {
    title: "Terms of Service | Jenga365",
    description: "Jenga365 Terms of Service",
};

export const dynamic = "force-dynamic";

export default async function TermsPage() {
    const page = await fetchLegalPageBySlug("terms");

    if (!page) {
        return (
            <main className="flex-1 bg-background">
                <PageHero
                    heading="Terms of Service"
                    description="The terms and conditions governing the use of the Jenga365 platform."
                />
                <section className="py-16 md:py-24">
                    <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-8 text-foreground-muted text-body leading-relaxed">
                        <div className="space-y-3">
                            <h2 className="text-display-xs text-foreground font-semibold">1. Acceptance of Terms</h2>
                            <p>
                                By accessing or using the Jenga365 platform, whether as a Mentee, Mentor, Corporate Partner, NGO, or visitor, you agree to be bound by these Terms of Service and all applicable regulations.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-display-xs text-foreground font-semibold">2. User Conduct and Code of Ethics</h2>
                            <p>
                                Mentors and Mentees are expected to maintain professional integrity, mutual respect, and confidentiality during all mentorship engagements. Any violation of trust, harassment, or breach of non-disclosure agreements may lead to account suspension or termination.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-display-xs text-foreground font-semibold">3. Environmental and Give-Back Verification</h2>
                            <p>
                                Field data submitted through verified partners and environmental monitoring tools (including tree planting logs and survival audits) must be accurate and truthful. Fraudulent submissions are grounds for immediate disqualification from partner benefits and milestones.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-display-xs text-foreground font-semibold">4. Intellectual Property and Content</h2>
                            <p>
                                All content published by Jenga365, including logos, branding, platform code, and learning pathways, is the property of Jenga365 or its respective contributors. Users retain ownership of their submitted articles while granting Jenga365 a non-exclusive license to display them.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-display-xs text-foreground font-semibold">5. Inquiries and Legal Notices</h2>
                            <p>
                                For inquiries concerning these terms, please contact <a href="mailto:legal@jenga365.org" className="text-foreground underline">legal@jenga365.org</a>.
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
