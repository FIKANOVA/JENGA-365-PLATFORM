"use client";

import NextLink from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth/client";
import { ArrowRight, FileText } from "lucide-react";

interface Article {
    _id?: string;
    id?: string;
    title: string;
    category?: string;
    excerpt?: string;
    mainImage?: { asset?: { url?: string } };
    image?: string;
    publishedAt?: string;
    date?: string;
    slug?: { current?: string } | string;
}

interface HomeArticlesSectionProps {
    readonly articles?: Article[];
}

function getSlug(article: Article): string {
    if (typeof article.slug === "object") return article.slug?.current ?? article._id ?? article.id ?? "";
    if (typeof article.slug === "string") return article.slug;
    return article.id ?? "";
}

function getImage(article: Article): string {
    return article.mainImage?.asset?.url ?? article.image ?? "";
}

function getDate(article: Article): string {
    if (article.publishedAt) {
        return new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }
    return article.date ?? "";
}

const FALLBACK_ARTICLES: Article[] = [
    { id: "1", title: "The future of rugby mentorship in East Africa", category: "Rugby", excerpt: "How structured guidance is changing the pathway for young athletes.", date: "Mar 2026" },
    { id: "2", title: "Scaling impact: the Jenga365 operating model", category: "Leadership", excerpt: "A deep dive into how AI agents are facilitating human growth at scale.", date: "Feb 2026" },
    { id: "3", title: "From mentee to mentor: a personal journey", category: "Career", excerpt: "Celebrating community-driven growth and sustainable transformation.", date: "Feb 2026" },
];

export default function HomeArticlesSection({ articles }: HomeArticlesSectionProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const displayArticles = (articles && articles.length > 0 ? articles : FALLBACK_ARTICLES).slice(0, 3);

    return (
        <section className="bg-background">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 md:py-32">
                <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
                    <div className="max-w-xl">
                        <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            Jenga Journal
                        </span>
                        <h2 className="mt-3 text-display-md">Insights from the field.</h2>
                        <p className="mt-4 text-body-lg" style={{ color: "var(--foreground-muted)" }}>
                            Quarterly digital impact zines, mentor stories, and corporate ESG case studies.
                        </p>
                    </div>
                    <NextLink
                        href="/resources/articles"
                        className="inline-flex items-center gap-1.5 text-label font-medium hover:underline underline-offset-4"
                        style={{ color: "var(--foreground)" }}
                    >
                        View archive
                        <ArrowRight className="h-4 w-4" />
                    </NextLink>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayArticles.map((article) => {
                        const slug = getSlug(article);
                        const img = getImage(article);
                        const date = getDate(article);
                        const id = article._id ?? article.id ?? slug;
                        return (
                            <NextLink
                                href={`/resources/articles/${slug}`}
                                key={id}
                                className="group flex flex-col rounded-lg border border-border bg-background overflow-hidden transition-shadow hover:shadow-lg"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden" style={{ background: "var(--surface-2)" }}>
                                    {img ? (
                                        <Image
                                            src={img}
                                            alt={article.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center" style={{ color: "var(--foreground-subtle)" }}>
                                            <FileText className="h-10 w-10" aria-hidden />
                                        </div>
                                    )}
                                    {article.category && (
                                        <span
                                            className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                                            style={{ background: "var(--background)", color: "var(--foreground)" }}
                                        >
                                            {article.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 p-6 gap-3">
                                    <h3
                                        className="text-headline line-clamp-2 transition-colors group-hover:opacity-80"
                                        style={{ color: "var(--foreground)" }}
                                    >
                                        {article.title}
                                    </h3>
                                    {article.excerpt && (
                                        <p className="text-body-sm line-clamp-2" style={{ color: "var(--foreground-muted)" }}>
                                            {article.excerpt}
                                        </p>
                                    )}
                                    <div className="mt-auto flex items-center justify-between pt-2">
                                        <span className="text-label" style={{ color: "var(--foreground-subtle)" }}>{date}</span>
                                        <ArrowRight
                                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                            style={{ color: "var(--brand-green)" }}
                                            aria-hidden
                                        />
                                    </div>
                                </div>
                            </NextLink>
                        );
                    })}
                </div>

                {/* Contributor CTA */}
                <div
                    className="mt-20 rounded-lg border border-border p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    style={{ background: "var(--surface-1)" }}
                >
                    <div>
                        <h3 className="text-headline" style={{ color: "var(--foreground)" }}>
                            Have a story to share?
                        </h3>
                        <p className="mt-2 text-body" style={{ color: "var(--foreground-muted)" }}>
                            Join our roster of contributors and publish your insights on Jenga Journal.
                        </p>
                    </div>
                    <NextLink
                        href={isAuthenticated ? "/dashboard/articles/new" : "/register"}
                        className="shrink-0 inline-flex items-center gap-2 h-11 px-5 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90"
                        style={{ background: "var(--brand-black)" }}
                    >
                        Become a contributor
                        <ArrowRight className="h-4 w-4" />
                    </NextLink>
                </div>
            </div>
        </section>
    );
}
