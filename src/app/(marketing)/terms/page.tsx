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
        // Fallback static page if not defined in Sanity yet
        return (
            <main className="flex-1 bg-background">
                <PageHero
                    title="Terms of Service"
                    subtitle="Placeholder for Terms of Service. Please add this page in Sanity Studio with the slug 'terms'."
                />
            </main>
        );
    }

    return (
        <main className="flex-1 bg-background">
            <PageHero
                title={page.title}
                subtitle={`Last updated: ${new Date(page.lastUpdated).toLocaleDateString()}`}
            />
            <section className="py-16 md:py-24">
                <div className="max-w-3xl mx-auto px-6 lg:px-8 prose prose-invert">
                    <PortableText value={page.body} components={components} />
                </div>
            </section>
        </main>
    );
}
