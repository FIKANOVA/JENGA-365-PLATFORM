"use client";

import { urlFor } from "@/lib/sanity/client";

interface SanityPartner {
    _id: string;
    name: string;
    website?: string;
    logo?: { asset?: { _id?: string; url?: string } };
}

interface PartnerCarouselProps {
    readonly partners?: SanityPartner[];
}

export default function PartnerCarousel({ partners = [] }: PartnerCarouselProps) {
    const withLogos = partners.filter((p) => p.logo?.asset?.url);

    // Fallback to placeholders if no partners are configured yet
    const displayPartners = withLogos.length > 0 ? withLogos : [
        { _id: "p1", name: "Acme Corp", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" } } },
        { _id: "p2", name: "Global Tech", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" } } },
        { _id: "p3", name: "Stripe", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" } } },
        { _id: "p4", name: "Microsoft", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" } } },
        { _id: "p5", name: "Spotify", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" } } }
    ];

    return (
        <section className="py-8 md:py-16 bg-background overflow-hidden border-b border-border">
            <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-border pb-10">
                    <div className="space-y-3">
                        <span className="text-eyebrow text-foreground-muted block text-center md:text-left">
                            Joint ventures
                        </span>
                        <h2 className="text-display-lg text-foreground text-center md:text-left">
                            Strategic allies.
                        </h2>
                    </div>
                    <p className="text-eyebrow text-foreground-muted text-center md:text-right max-w-[220px]">
                        Architecting the Jenga365 ecosystem
                    </p>
                </div>
            </div>

            <div className="relative group">
                <div className="flex animate-scroll hover:pause whitespace-nowrap">
                    {[...displayPartners, ...displayPartners, ...displayPartners].map((partner, i) => {
                        const logoUrl = partner.logo?.asset?.url?.startsWith("http")
                            ? partner.logo.asset.url
                            : urlFor(partner.logo).height(160).fit("max").auto("format").url();
                        const inner = (
                            <img
                                src={logoUrl}
                                alt={partner.name}
                                className="h-10 md:h-12 w-auto object-contain grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:scale-110"
                            />
                        );
                        return partner.website ? (
                            <a
                                key={`${partner._id}-${i}`}
                                href={partner.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center mx-12 md:mx-20 flex-shrink-0"
                            >
                                {inner}
                            </a>
                        ) : (
                            <div
                                key={`${partner._id}-${i}`}
                                className="flex items-center justify-center mx-12 md:mx-20 flex-shrink-0"
                            >
                                {inner}
                            </div>
                        );
                    })}
                </div>

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
