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
    const withLogos = partners.filter((p) => p.logo?.asset?.url || p.logo?.asset?._id);

    // Fallback to official clean partner SVGs if no partners configured in Sanity yet
    const displayPartners = withLogos.length > 0 ? withLogos : [
        { _id: "p1", name: "Standard Chartered", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" } } },
        { _id: "p2", name: "Google Cloud", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" } } },
        { _id: "p3", name: "Stripe", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" } } },
        { _id: "p4", name: "Microsoft", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" } } },
        { _id: "p5", name: "Spotify", logo: { asset: { url: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg" } } },
    ];

    return (
        <section className="py-6 sm:py-8 bg-background overflow-hidden border-b border-border">
            <div className="mx-auto max-w-7xl px-4 mb-4 sm:mb-5">
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-center text-foreground-muted/60">
                    Trusted by forward-thinking partners & organizations
                </p>
            </div>

            <div className="relative group">
                <div className="flex items-center animate-scroll hover:pause whitespace-nowrap">
                    {[...displayPartners, ...displayPartners, ...displayPartners].map((partner, i) => {
                        const isSanityImage = !!partner.logo?.asset?._id;
                        const logoUrl = isSanityImage
                            ? urlFor(partner.logo).height(120).fit("max").auto("format").url()
                            : partner.logo?.asset?.url;

                        if (!logoUrl) return null;

                        const logoElement = (
                            <div className="h-10 sm:h-12 w-28 sm:w-36 flex items-center justify-center px-3">
                                <img
                                    src={logoUrl}
                                    alt={partner.name}
                                    loading="lazy"
                                    className="max-h-7 sm:max-h-8 max-w-full w-auto h-auto object-contain grayscale opacity-40 group-hover:opacity-60 hover:!grayscale-0 hover:!opacity-100 transition-all duration-300 hover:scale-105"
                                />
                            </div>
                        );

                        return partner.website ? (
                            <a
                                key={`${partner._id}-${i}`}
                                href={partner.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={partner.name}
                                className="inline-flex items-center justify-center flex-shrink-0 focus:outline-none"
                            >
                                {logoElement}
                            </a>
                        ) : (
                            <div
                                key={`${partner._id}-${i}`}
                                title={partner.name}
                                className="inline-flex items-center justify-center flex-shrink-0"
                            >
                                {logoElement}
                            </div>
                        );
                    })}
                </div>

                {/* Left & Right Gradient Fade Masks */}
                <div className="absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
                <div className="absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
            </div>

            <style jsx global>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                .animate-scroll {
                    animation: scroll 35s linear infinite;
                }
                .pause:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}
