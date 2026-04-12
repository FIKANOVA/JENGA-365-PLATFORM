"use client";

/**
 * PageHero — reusable full-width hero banner with bg image/video support.
 * Used on all sub-page heroes across the marketing site.
 */

interface PageHeroProps {
    /** Eyebrow label above the heading */
    eyebrow?: string;
    eyebrowColor?: string;
    /** Main heading — supports JSX for coloured spans */
    heading: React.ReactNode;
    /** Sub-copy */
    description?: string;
    /** Background image URL */
    bgImage: string;
    /** Fallback image if bgImage fails to load */
    bgFallback?: string;
    /** Overlay darkness (0–100). Default 65 */
    overlayOpacity?: number;
    /** Extra content below description (e.g. search bar, CTAs) */
    children?: React.ReactNode;
    /** Min height class. Default "min-h-[50vh]" */
    minHeight?: string;
}

export default function PageHero({
    eyebrow,
    eyebrowColor = "var(--primary-green)",
    heading,
    description,
    bgImage,
    bgFallback,
    overlayOpacity = 65,
    children,
    minHeight = "min-h-[50vh]",
}: PageHeroProps) {
    const overlayStyle = { backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` };

    return (
        <div className={`relative flex items-end ${minHeight} overflow-hidden border-b border-white/10`}>
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src={bgImage}
                    alt=""
                    className="w-full h-full object-cover object-center"
                    onError={
                        bgFallback
                            ? (e) => { (e.target as HTMLImageElement).src = bgFallback; }
                            : undefined
                    }
                />
                <div className="absolute inset-0" style={overlayStyle} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-[var(--primary-green)]/40 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-16 pt-40">
                <div className="max-w-4xl space-y-6">
                    {eyebrow && (
                        <span
                            className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold block"
                            style={{ color: eyebrowColor }}
                        >
                            {eyebrow}
                        </span>
                    )}
                    <h1 className="font-serif font-black text-5xl md:text-7xl text-white uppercase leading-[0.9] tracking-tighter">
                        {heading}
                    </h1>
                    {description && (
                        <p className="text-xl text-white/75 max-w-2xl font-light leading-relaxed font-sans">
                            {description}
                        </p>
                    )}
                    {children && <div className="pt-2">{children}</div>}
                </div>
            </div>
        </div>
    );
}
