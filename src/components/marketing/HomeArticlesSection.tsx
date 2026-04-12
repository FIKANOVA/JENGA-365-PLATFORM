"use client";

import NextLink from "next/link";
import { useSession } from "@/lib/auth/client";
import Image from "next/image";

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
    { id: "1", title: "The Future of Rugby Mentorship in East Africa", category: "RUGBY", excerpt: "How structured guidance is changing the pathway for young athletes.", image: "https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80", date: "Mar 2026" },
    { id: "2", title: "Scaling Impact: The Jenga365 Operating Model", category: "LEADERSHIP", excerpt: "A deep dive into how AI Agents are facilitating human growth at scale.", image: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80", date: "Feb 2026" },
    { id: "3", title: "From Mentee to Mentor: A Personal Journey", category: "CAREER", excerpt: "Celebrating 10 years of community-driven growth and sustainable transformation.", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80", date: "Feb 2026" },
];

export default function HomeArticlesSection({ articles }: HomeArticlesSectionProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const displayArticles = (articles && articles.length > 0 ? articles : FALLBACK_ARTICLES).slice(0, 3);

    return (
        <section className="bg-background">
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h4 className="text-primary font-bold uppercase tracking-widest text-sm mb-2 font-mono">Insights</h4>
                        <h2 className="text-3xl md:text-5xl font-black text-foreground font-playfair uppercase">Top Articles</h2>
                    </div>
                    <NextLink href="/resources/articles" className="text-primary font-bold font-mono text-sm flex items-center gap-1 hover:underline">
                        View Archive <span className="material-symbols-outlined text-[1.2rem]">chevron_right</span>
                    </NextLink>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {displayArticles.map((article) => {
                        const slug = getSlug(article);
                        const img = getImage(article);
                        const date = getDate(article);
                        const id = article._id ?? article.id ?? slug;
                        return (
                            <NextLink href={`/resources/articles/${slug}`} key={id} className="group cursor-pointer">
                                <div className="aspect-[16/10] overflow-hidden rounded-xl mb-6 relative bg-black">
                                    {img && (
                                        <Image
                                            src={img}
                                            alt={article.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    )}
                                    <div className="absolute top-4 left-4 z-10">
                                        <span className="bg-foreground/90 text-background backdrop-blur-sm text-xs font-mono font-bold uppercase py-1 px-3 rounded shadow-md">
                                            {article.category ?? "GENERAL"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold font-playfair mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-muted-foreground font-sans line-clamp-2 mb-4 leading-relaxed text-sm">
                                        {article.excerpt ?? ""}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono font-bold uppercase tracking-widest">
                                        <span>{date}</span>
                                        <span className="text-primary group-hover:translate-x-2 transition-transform material-symbols-outlined">arrow_forward</span>
                                    </div>
                                </div>
                            </NextLink>
                        );
                    })}
                </div>

                {/* Conversion Banner */}
                <div className="mt-20 border border-border p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-primary/40 transition-colors">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black font-playfair text-foreground mb-2 uppercase">Have a story to share?</h3>
                        <p className="text-muted-foreground font-sans">Join our community of thought leaders and publish your insights.</p>
                    </div>
                    <NextLink
                        href={isAuthenticated ? "/dashboard/articles/new" : "/register"}
                        className="shrink-0 flex items-center gap-2 px-8 py-4 bg-black text-white font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-primary transition-all"
                    >
                        Become a Contributor
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </NextLink>
                </div>
            </div>
        </section>
    );
}
