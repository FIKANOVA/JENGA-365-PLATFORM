"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { User } from "lucide-react";

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
            className="w-full flex flex-col md:flex-row gap-0 bg-white border border-border rounded-md overflow-hidden shadow-2xl shadow-black/5 hover:border-[var(--brand-green)] transition-all duration-500 cursor-pointer group"
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
                    <span className="bg-[var(--brand-green)] text-white text-label font-bold px-3 py-1.5 shadow-xl">
                        Featured Insight
                    </span>
                    <span className="bg-white text-black text-label font-bold px-3 py-1.5 shadow-xl">
                        {category}
                    </span>
                </div>
            </div>

            <div className="w-full md:w-1/2 flex flex-col justify-center p-12 md:p-20 space-y-8 bg-white relative">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[var(--brand-green)] text-eyebrow">
                        <span className="w-8 h-px bg-[var(--brand-green)]"></span>
                        <span>{readTime}</span>
                    </div>

                    <h2 className="text-display-md text-foreground leading-[1.1] group-hover:text-[var(--brand-green)] transition-colors duration-500">
                        {title}
                    </h2>

                    <p className="font-light text-[15px] text-[var(--foreground-muted)] leading-relaxed line-clamp-3">
                        {excerpt}
                    </p>
                </div>

                <div className="pt-8 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[var(--surface-1)] border border-border rounded-md flex items-center justify-center overflow-hidden">
                            <User className="h-5 w-5 text-[var(--foreground-subtle)]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-body-sm font-medium text-foreground">{author}</span>
                            <span className="text-eyebrow text-[var(--foreground-subtle)]">{date}</span>
                        </div>
                    </div>
                    
                    <span className="text-eyebrow text-black group-hover:text-[var(--brand-green)] transition-colors">
                        Read Story →
                    </span>
                </div>
            </div>
        </motion.article>
        </Link>
    );
}
