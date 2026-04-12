"use client";

import Image from "next/image";
import Link from "next/link";

interface RelatedArticle {
    readonly id: string;
    readonly title: string;
    readonly image: string;
    readonly date: string;
    readonly readTime: string;
    readonly slug?: string;
}

interface RelatedArticlesProps {
    readonly articles: RelatedArticle[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <span className="w-10 h-0.5 bg-[var(--red)]"></span>
                <h3 className="font-serif font-black text-2xl text-black uppercase tracking-tight">Other Stories</h3>
            </div>

            <div className="space-y-8">
                {articles.map((article) => (
                    <Link
                        key={article.id}
                        href={`/resources/articles/${article.slug ?? article.id}`}
                        className="group flex items-start gap-6"
                    >
                        <div className="relative size-24 rounded-sm overflow-hidden shrink-0 border border-[var(--border)] bg-black shadow-xl">
                            <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-80 group-hover:opacity-100"
                            />
                        </div>
                        <div className="flex flex-col gap-2 justify-center py-1">
                            <h4 className="font-serif font-bold text-[15px] text-black line-clamp-2 leading-tight group-hover:text-[var(--red)] transition-colors uppercase">
                                {article.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[var(--text-muted)] font-mono text-[9px] uppercase tracking-widest font-bold">
                                <span>{article.readTime}</span>
                                <span className="w-4 h-px bg-[var(--border)]"></span>
                                <span>{article.date}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <Link
                href="/resources/articles"
                className="flex items-center justify-center w-full py-4 border border-[var(--border)] text-black font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all rounded-sm shadow-sm"
            >
                View Library
            </Link>
        </div>
    );
}
