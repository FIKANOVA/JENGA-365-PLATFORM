"use client";

import { motion } from "framer-motion";

const CDN = "https://jenga365.com/wp-content/uploads";

const fallbackPartners = [
    {
        name: "MindStrong",
        url: "https://www.instagram.com/project.mindstrong/",
        img: `${CDN}/2025/08/21cf0c0b-4d85-4354-9f42-c000f2b5e827.jpeg`,
    },
    {
        name: "Pinetote",
        url: "https://pinetote.com/",
        img: `${CDN}/2025/08/pinetote.png`,
    },
    {
        name: "ETCO Kenya",
        url: "https://www.etco-kenya.org/",
        img: `${CDN}/2025/08/ETCO-logo.png`,
    },
    {
        name: "Try Again Project",
        url: "#",
        img: `${CDN}/2025/12/TAP-2.png`,
    },
    {
        name: "AISA",
        url: "#",
        img: `${CDN}/2025/12/AISA.png`,
    },
];

interface Partner {
    name: string;
    url: string;
    img?: string;
    logoUrl?: string; // from sanity
}

interface PartnerCarouselProps {
    readonly partners?: Partner[];
}

export default function PartnerCarousel({ partners = fallbackPartners }: PartnerCarouselProps) {
    return (
        <section className="py-32 bg-background overflow-hidden border-b border-border">
            <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 border-b border-border pb-12">
                    <div className="space-y-4">
                        <span className="section-label block text-center md:text-left">Joint Ventures</span>
                        <h2 className="font-serif font-bold text-5xl md:text-5xl text-foreground uppercase leading-[0.9] tracking-tighter text-center md:text-left">
                            Strategic <br /><span className="italic text-primary transition-colors duration-500 hover:text-secondary">Allies.</span>
                        </h2>
                    </div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-muted-foreground font-bold text-center md:text-right max-w-[200px]">
                        Architecting the Jenga365 Ecosystem
                    </p>
                </div>
            </div>

            <div className="relative group">
                <div className="flex animate-scroll hover:pause whitespace-nowrap">
                    {[...partners, ...partners, ...partners].map((partner, i) => (
                        <a
                            key={i}
                            href={partner.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center mx-12 md:mx-20 flex-shrink-0"
                        >
                            <img
                                src={partner.img || partner.logoUrl || ""}
                                alt={partner.name}
                                className="h-10 md:h-12 w-auto object-contain grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:scale-110"
                            />
                        </a>
                    ))}
                </div>

                {/* Gradient Overlays */}
                <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>

            <style jsx global>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                .pause {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
