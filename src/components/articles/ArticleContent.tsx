"use client";

import Image from "next/image";
import { PortableText } from "@portabletext/react";

interface ArticleContentProps {
    readonly content: any; // Sanity block content array or null
    readonly author: {
        readonly name: string;
        readonly role: string;
        readonly bio: string;
        readonly avatar: string;
    };
    readonly publishedAt?: string;
}

export default function ArticleContent({ author, content, publishedAt }: ArticleContentProps) {
    return (
        <div className="flex flex-col lg:flex-row gap-16 py-10">
            {/* Sidebar / Info */}
            <aside className="w-full lg:w-[260px] shrink-0 space-y-12">
                <div className="space-y-8 lg:sticky lg:top-[120px]">
                    {/* Author Profile */}
                    <div className="space-y-6">
                        <div className="relative size-24 rounded-sm border border-[var(--border)] p-1 bg-white shadow-xl">
                            <div className="relative w-full h-full rounded-sm overflow-hidden bg-[var(--off-white)]">
                                <Image
                                    src={author.avatar}
                                    alt={author.name}
                                    fill
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <h3 className="font-serif font-bold text-2xl text-black">{author.name}</h3>
                                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--primary-green)] font-bold block">
                                    {author.role}
                                </span>
                            </div>
                            <p className="text-[var(--text-secondary)] text-[14px] leading-relaxed font-light">
                                {author.bio}
                            </p>
                            <button className="pt-2 flex items-center gap-2 group text-[10px] font-mono uppercase tracking-widest text-black hover:text-[var(--primary-green)] transition-colors">
                                <span className="w-6 h-px bg-black group-hover:bg-[var(--primary-green)] transition-colors"></span>
                                Follow Profile
                            </button>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-6 pt-10 border-t border-[var(--border)]">
                        <div className="space-y-4">
                            <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">Topic Area</h4>
                            <div className="flex flex-wrap gap-2">
                                {["MENTORSHIP", "RUGBY", "IMPACT"].map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-[var(--off-white)] border border-[var(--border)] text-[9px] font-mono tracking-widest uppercase">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <article className="flex-1 w-full prose prose-pre:bg-black prose-pre:text-white prose-headings:font-serif prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-light prose-p:text-[16px] prose-p:leading-[1.8] prose-p:text-[var(--text-secondary)] prose-strong:font-bold prose-strong:text-black max-w-none">
                {content ? (
                    <PortableText
                        value={content}
                        components={{
                            types: {
                                image: ({ value }: any) => {
                                    if (!value?.url) return null;
                                    // eslint-disable-next-line @next/next/no-img-element
                                    return <img src={value.url} alt={value?.alt ?? ""} className="rounded-sm w-full my-8" />;
                                },
                            },
                            marks: {
                                link: ({ children, value }: any) => {
                                    const href = (value?.href ?? "") as string;
                                    const isSafe =
                                        href.startsWith("/") ||
                                        href.startsWith("https://jenga365.com");
                                    return isSafe ? (
                                        <a href={href} rel="noopener noreferrer">
                                            {children}
                                        </a>
                                    ) : (
                                        <span>{children}</span>
                                    );
                                },
                            },
                            unknownMark: ({ children }: any) => <span>{children}</span>,
                            unknownType: () => null,
                        }}
                    />
                ) : (
                    <>
                        <div className="font-serif italic text-2xl text-black leading-relaxed border-l-[3px] border-[var(--primary-green)] pl-8 mb-16 py-2">
                            "Strategic foresight in mentorship creates ripples that transform not just one athlete, but an entire ecosystem of professional excellence."
                        </div>

                        <h2 id="intro">The Evolution of Impact</h2>
                        <p>
                            As digital transformation accelerates across emerging markets, traditional centralized architectures often crumble under the realities of inconsistent network infrastructure. Jenga365 addresses this by weaving professional networks into the very fabric of community engagement.
                        </p>

                        <figure className="my-16 space-y-4">
                            <div className="relative aspect-[16/9] rounded-sm overflow-hidden shadow-2xl border border-[var(--border)] bg-black">
                                <Image
                                    src="https://jenga365.com/wp-content/uploads/2025/07/Fanaka-Studios-SportPesa-Cheza-Dimba-Northrift-11-of-429-scaled.jpg"
                                    alt="Mentorship Impact"
                                    fill
                                    className="object-cover grayscale opacity-80"
                                />
                            </div>
                            <figcaption className="text-[11px] font-mono uppercase tracking-[0.3em] text-[var(--text-muted)] text-center">
                                Snapshot: Jenga365 Field Impact Clinic, 2024
                            </figcaption>
                        </figure>

                        <h2 id="logic">Resilience by Design</h2>
                        <p>
                            The platform&apos;s AI-native matching engine ensures that every connection is built on a foundation of shared values and professional synergy. We are no longer just connecting people; we are curating pathways to success.
                        </p>

                        <blockquote className="my-14 p-12 bg-[var(--off-white)] border-l-[6px] border-[var(--primary-green)] rounded-sm text-2xl font-serif italic text-black leading-tight">
                            &quot;Greatness is never achieved in isolation. The Jenga365 platform is the connective tissue for the next generation of global stars.&quot;
                        </blockquote>
                    </>
                )}
            </article>
        </div>
    );
}
