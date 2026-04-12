import { fetchArticleBySlug, fetchRelatedArticles } from "@/lib/sanity/queries";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ArticleContent from "@/components/articles/ArticleContent";
import RelatedArticles from "@/components/articles/RelatedArticles";
import ArticleAuthGate from "@/components/articles/ArticleAuthGate";
import { ARTICLES } from "@/data/mockData";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const article = await fetchArticleBySlug(slug).catch(() => null);
    if (!article) return { title: "Article — Jenga365" };
    return {
        title: `${article.title} — Jenga365`,
        description: article.excerpt,
    };
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Try Sanity first, fall back to mock data
    let article = await fetchArticleBySlug(slug).catch(() => null);

    if (!article) {
        // Fall back to mock data by slug/id
        const mock = ARTICLES.find((a) => a.id === slug) ?? null;
        if (!mock) notFound();
        article = {
            ...mock,
            slug: { current: mock.id },
            mainImage: { asset: { url: mock.image } },
            author: { name: mock.author, role: mock.role },
            publishedAt: mock.date,
            body: null,
            readTime: 5,
        };
    }

    // Fetch session server-side
    const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
    const isAuthenticated = !!session?.user;

    // Fetch related articles
    const relatedRaw = await fetchRelatedArticles(slug).catch(() => []);
    const relatedArticles = relatedRaw.map((a: any) => ({
        id: a._id,
        title: a.title,
        image: a.mainImage?.asset?.url ?? "",
        date: a.publishedAt ? formatDate(a.publishedAt) : "",
        readTime: "5 min read",
        slug: a.slug?.current ?? a._id,
    }));

    const authorName = article.author?.name ?? "Jenga365 Team";
    const authorRole = article.author?.role ?? "STAFF";
    const heroImage = article.mainImage?.asset?.url ?? article.image ?? "";
    const readTime = article.readTime ? `${article.readTime} min read` : "5 min read";
    const publishedDate = article.publishedAt ? formatDate(article.publishedAt) : "";

    return (
        <div className="min-h-screen bg-white">
            <main>
                {/* ── Hero Section ── */}
                <section className="relative w-full h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
                    <div className="absolute inset-0 bg-black/60 z-10" />
                    {heroImage && (
                        <div className="absolute inset-0">
                            <Image
                                src={heroImage}
                                alt={article.title}
                                fill
                                className="object-cover grayscale brightness-50"
                                priority
                            />
                        </div>
                    )}

                    <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
                        <div className="space-y-8">
                            <div className="flex justify-center items-center gap-4">
                                <span className="bg-[var(--primary-green)] text-white text-[10px] font-mono font-bold px-4 py-1.5 uppercase tracking-[0.3em] rounded-sm shadow-2xl">
                                    {article.category ?? "Insight"}
                                </span>
                                <span className="text-white/60 text-[10px] font-mono tracking-[0.3em] uppercase">
                                    — {readTime}
                                </span>
                            </div>
                            <h1 className="text-white text-5xl md:text-8xl font-serif font-black uppercase leading-[0.9] tracking-tighter">
                                {article.title}
                            </h1>
                            {article.excerpt && (
                                <p className="text-white/80 text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed">
                                    {article.excerpt}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Main Content Grid ── */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Reading Area */}
                        <div className="lg:col-span-8">
                            <ArticleContent
                                author={{
                                    name: authorName,
                                    role: authorRole,
                                    avatar: article.author?.image?.asset?.url ?? "",
                                    bio: `${authorName} — ${authorRole} at Jenga365`,
                                }}
                                content={article.body}
                                publishedAt={publishedDate}
                            />
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:col-span-4">
                            <div className="sticky top-[120px] space-y-16">
                                <RelatedArticles articles={relatedArticles} />
                                {!isAuthenticated && <ArticleAuthGate />}
                            </div>
                        </aside>
                    </div>
                </div>

                {/* ── Guest Footer CTA ── */}
                {!isAuthenticated && (
                    <section className="bg-[var(--off-white)] border-t border-[var(--border)] py-32 mt-20">
                        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center space-y-10">
                            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--primary-green)]">Final Word</span>
                            <h2 className="text-5xl md:text-6xl font-serif font-black text-black leading-tight uppercase">
                                Ready to go <span className="italic text-[var(--primary-green)]">Deeper?</span>
                            </h2>
                            <p className="text-lg text-[var(--text-secondary)] font-light max-w-2xl leading-relaxed">
                                Jenga365 is more than a platform; it's an ecosystem of excellence. Join thousands of high-performers today.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6 pt-6">
                                <Link href="/register" className="px-12 py-5 bg-[var(--primary-green)] text-white font-mono text-[10px] uppercase tracking-widest rounded-sm hover:bg-black transition-all">
                                    CREATE FREE ACCOUNT
                                </Link>
                                <Link href="/login" className="px-12 py-5 border border-[var(--border)] text-black font-mono text-[10px] uppercase tracking-widest rounded-sm hover:bg-black hover:text-white transition-all">
                                    LOG IN
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
