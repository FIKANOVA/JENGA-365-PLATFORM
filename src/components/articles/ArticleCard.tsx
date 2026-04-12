"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface ArticleCardProps {
    readonly title: string;
    readonly excerpt: string;
    readonly author: string;
    readonly date: string;
    readonly category: string;
    readonly image: string;
    readonly readTime: string;
    readonly slug: string;
}

export default function ArticleCard({
    title,
    excerpt,
    author,
    date,
    category,
    image,
    readTime,
    slug,
}: ArticleCardProps) {
    return (
        <Link href={`/resources/articles/${slug}`} className="h-full block">
        <motion.article
            whileHover={{ y: -8 }}
            className="flex flex-col border border-[var(--border)] rounded-sm bg-white overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer h-full"
        >
            <div className="w-full aspect-[16/10] relative overflow-hidden">
                <div className="absolute inset-0 bg-black/60 z-10 group-hover:bg-transparent transition-all duration-700 pointer-events-none" />
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute top-6 left-6 z-20">
                    <span className="bg-white text-black px-3 py-1.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-[0.2em] shadow-xl">
                        {category}
                    </span>
                </div>
            </div>

            <div className="flex flex-col p-8 md:p-10 space-y-6 flex-1 bg-white">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 text-[var(--primary-green)] font-mono text-[9px] uppercase tracking-[0.3em] font-bold">
                        <span>{readTime}</span>
                        <span className="w-4 h-px bg-[var(--border)]"></span>
                        <span className="text-[var(--text-muted)]">{date}</span>
                    </div>

                    <h3 className="font-serif font-black text-2xl text-black leading-tight group-hover:text-[var(--primary-green)] transition-colors duration-500 line-clamp-2 min-h-[2.8em] uppercase">
                        {title}
                    </h3>

                    <p className="font-light text-[14px] text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                        {excerpt}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-[var(--border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[var(--off-white)] border border-[var(--border)] rounded-sm flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-[16px] text-[var(--text-muted)]">person</span>
                        </div>
                        <span className="font-serif font-bold text-[13px] text-black">{author}</span>
                    </div>
                    
                    <div className="w-6 h-6 bg-[var(--primary-green)] rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                        <span className="material-symbols-outlined text-white text-[14px]">arrow_outward</span>
                    </div>
                </div>
            </div>
        </motion.article>
        </Link>
    );
}
