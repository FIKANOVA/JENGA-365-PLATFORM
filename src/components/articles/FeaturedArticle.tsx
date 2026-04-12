"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface FeaturedArticleProps {
    readonly title: string;
    readonly excerpt: string;
    readonly author: string;
    readonly role: string;
    readonly category: string;
    readonly image: string;
    readonly slug: string;
    readonly readTime?: string;
    readonly date?: string;
}

export default function FeaturedArticle({
    title,
    excerpt,
    author,
    role,
    category,
    image,
    slug,
    readTime = "5 min read",
    date = "Mar 12, 2024"
}: FeaturedArticleProps) {
    return (
        <Link href={`/resources/articles/${slug}`} className="block">
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col md:flex-row gap-0 bg-white border border-[var(--border)] rounded-sm overflow-hidden shadow-2xl shadow-black/5 hover:border-[var(--primary-green)] transition-all duration-500 cursor-pointer group"
        >
            <div className="w-full md:w-1/2 aspect-[16/10] md:aspect-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-all duration-700 pointer-events-none" />
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                />
                <div className="absolute bottom-8 left-8 z-20 flex gap-3">
                    <span className="bg-[var(--primary-green)] text-white text-[9px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest shadow-xl">
                        Featured Insight
                    </span>
                    <span className="bg-white text-black text-[9px] font-mono font-bold px-3 py-1.5 uppercase tracking-widest shadow-xl">
                        {category}
                    </span>
                </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center p-12 md:p-20 space-y-8 bg-white relative">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[var(--primary-green)] font-mono text-[10px] uppercase tracking-[0.3em]">
                        <span className="w-8 h-px bg-[var(--primary-green)]"></span>
                        <span>{readTime}</span>
                    </div>

                    <h2 className="font-serif font-bold text-4xl text-black leading-[1.1] uppercase group-hover:text-[var(--primary-green)] transition-colors duration-500">
                        {title}
                    </h2>

                    <p className="font-light text-[15px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                        {excerpt}
                    </p>
                </div>

                <div className="pt-8 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[var(--off-white)] border border-[var(--border)] rounded-sm flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-[20px] text-[var(--text-muted)]">person</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif font-bold text-sm text-black">{author}</span>
                            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)]">{date}</span>
                        </div>
                    </div>
                    
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-black group-hover:text-[var(--primary-green)] transition-colors">
                        Read Story →
                    </span>
                </div>
            </div>
        </motion.article>
        </Link>
    );
}
