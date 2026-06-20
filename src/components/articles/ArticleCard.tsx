"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, ArrowUpRight } from "lucide-react";

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
            className="flex flex-col border border-border rounded-md bg-white overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer h-full"
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
                    <span className="bg-white text-black px-3 py-1.5 rounded-md text-label font-bold shadow-xl">
                        {category}
                    </span>
                </div>
            </div>

            <div className="flex flex-col p-8 md:p-10 space-y-6 flex-1 bg-white">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 text-[var(--brand-green)] text-eyebrow font-bold">
                        <span>{readTime}</span>
                        <span className="w-4 h-px bg-[var(--border)]"></span>
                        <span className="text-[var(--foreground-subtle)]">{date}</span>
                    </div>

                    <h3 className="text-display-sm text-foreground leading-tight group-hover:text-[var(--brand-green)] transition-colors duration-500 line-clamp-2 min-h-[2.8em]">
                        {title}
                    </h3>

                    <p className="font-light text-[14px] text-[var(--foreground-muted)] line-clamp-3 leading-relaxed">
                        {excerpt}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[var(--surface-1)] border border-border rounded-md flex items-center justify-center overflow-hidden">
                            <User className="h-4 w-4 text-[var(--foreground-subtle)]" />
                        </div>
                        <span className="text-body-sm font-medium text-foreground">{author}</span>
                    </div>

                    <div className="w-6 h-6 bg-[var(--brand-green)] rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                        <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                    </div>
                </div>
            </div>
        </motion.article>
        </Link>
    );
}
