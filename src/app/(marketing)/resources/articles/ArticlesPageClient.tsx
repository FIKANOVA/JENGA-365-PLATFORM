"use client";

import { useState, useMemo } from "react";
import { useSession } from "@/lib/auth/client";
import { Search, SearchX, PenSquare } from "lucide-react";
import FeaturedArticle from "@/components/articles/FeaturedArticle";
import ArticlesGrid from "@/components/articles/ArticlesGrid";
import TopicFilters from "@/components/marketing/resources/TopicFilters";
import PageHero from "@/components/shared/PageHero";
import Link from "next/link";
import { motion } from "framer-motion";
import { ARTICLES } from "@/data/mockData";

interface ArticlesPageClientProps {
    readonly initialArticles: any[];
}

function normalizeArticle(a: any) {
    return {
        ...a,
        id: a._id ?? a.id,
        slug: a.slug?.current ?? a.slug ?? a.id ?? "",
        excerpt: a.excerpt ?? "",
        author: a.author?.name ?? a.author ?? "Jenga365 Team",
        category: a.category ?? "GENERAL",
        image: a.mainImage?.asset?.url ?? a.image ?? "",
        date: a.publishedAt
            ? new Date(a.publishedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : (a.date ?? ""),
        readTime: a.readTime ? `${a.readTime} min read` : "5 min read",
        isFeatured: a.isFeatured ?? false,
    };
}

export default function ArticlesPageClient({ initialArticles }: ArticlesPageClientProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTopic, setActiveTopic] = useState("All Topics");

    // Fall back to mock data if Sanity returns nothing
    const rawArticles = initialArticles.length > 0 ? initialArticles : ARTICLES;
    const articles = rawArticles.map(normalizeArticle);

    const featured = articles.find((a) => a.isFeatured) ?? articles[0];

    const filteredArticles = useMemo(() => {
        return articles.filter((article) => {
            if (featured && article.id === featured.id) return false;
            const matchesSearch =
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.author.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTopic =
                activeTopic === "All Topics" ||
                article.category === activeTopic ||
                article.category?.toLowerCase() === activeTopic.toLowerCase();
            return matchesSearch && matchesTopic;
        });
    }, [articles, searchQuery, activeTopic, featured]);

    return (
        <div className="min-h-screen bg-white">
            <main>
                <PageHero
                    eyebrow="Articles"
                    heading={<>Insights <span className="italic text-primary">&amp; Thought Leadership.</span></>}
                    bgImage="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1920&auto=format&fit=crop"
                    bgFallback="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1920&auto=format&fit=crop"
                >
                    <div className="relative max-w-2xl group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/40 group-focus-within:text-primary">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search articles, topics, or authors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 backdrop-blur-sm rounded-md py-5 pl-14 pr-8 text-white placeholder:text-white/40 placeholder:font-mono placeholder:text-label placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:border-primary transition-all font-sans"
                        />
                    </div>
                </PageHero>

                {/* Breadcrumb */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8">
                    <Link href="/resources" className="font-mono text-eyebrow tracking-widest text-[var(--foreground-subtle)] hover:text-black transition-colors">
                        ← Resources
                    </Link>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-6 border-b border-border pb-10 mb-16">
                        <span className="font-mono text-eyebrow tracking-[0.3em] text-[var(--foreground-subtle)]">Filter</span>
                        <TopicFilters activeTopic={activeTopic} onTopicChange={setActiveTopic} />
                    </div>

                    {/* Featured */}
                    {featured && !searchQuery && activeTopic === "All Topics" && (
                        <div className="mb-24">
                            <FeaturedArticle
                                title={featured.title}
                                excerpt={featured.excerpt}
                                author={featured.author}
                                role={featured.role ?? "STAFF"}
                                category={featured.category}
                                image={featured.image}
                                slug={featured.slug}
                                date={featured.date}
                                readTime={featured.readTime}
                            />
                        </div>
                    )}

                    {/* Contribute banner */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="mb-16 w-full p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-[var(--brand-green)]/20 bg-[var(--green-tint)]"
                    >
                        <div className="space-y-3">
                            <h3 className="text-display-sm text-foreground">
                                {isAuthenticated ? "Share your expertise" : "Join the movement"}
                            </h3>
                            <p className="font-light text-[15px] text-[var(--foreground-muted)] leading-relaxed max-w-xl">
                                {isAuthenticated
                                    ? "Your professional journey could be the roadmap for a future star."
                                    : "Register to publish articles and join our global network of contributors."}
                            </p>
                        </div>
                        <Link
                            href={isAuthenticated ? "/dashboard/articles/new" : "/register"}
                            className="shrink-0 h-14 px-10 bg-[var(--brand-green)] text-white text-label font-mono uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl flex items-center"
                        >
                            {isAuthenticated ? "Publish Article" : "Create Free Account"}
                        </Link>
                    </motion.div>

                    {/* Grid */}
                    <div className="min-h-[400px]">
                        {filteredArticles.length > 0 ? (
                            <ArticlesGrid articles={filteredArticles} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                                <SearchX className="h-16 w-16 text-[var(--border)]" />
                                <h3 className="text-display-md text-foreground">No results found</h3>
                                <button
                                    onClick={() => { setSearchQuery(""); setActiveTopic("All Topics"); }}
                                    className="px-8 py-3 border border-border text-black font-mono text-eyebrow tracking-widest hover:bg-black hover:text-white transition-all"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isAuthenticated && (
                <div className="fixed bottom-12 right-12 z-[60] group">
                    <Link
                        href="/dashboard/articles/new"
                        className="flex items-center justify-center w-16 h-16 bg-[var(--brand-green)] text-white rounded-full shadow-2xl hover:bg-black hover:scale-110 transition-all duration-500"
                    >
                        <PenSquare className="h-6 w-6" />
                    </Link>
                </div>
            )}
        </div>
    );
}
