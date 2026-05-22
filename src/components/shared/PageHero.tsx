/**
 * PageHero — reusable hero banner shared across marketing sub-pages.
 * Canonical tokens (DESIGN.md §11): neutral surface + faint topo pattern,
 * Inter typography. Stock background images are ignored — kept on the prop
 * surface only for backwards compatibility with legacy callers.
 */
interface PageHeroProps {
    eyebrow?: string;
    /** @deprecated use canonical brand-green eyebrow */
    eyebrowColor?: string;
    heading: React.ReactNode;
    description?: string;
    /** @deprecated stock photos are forbidden per DESIGN.md §11 */
    bgImage?: string;
    /** @deprecated */
    bgFallback?: string;
    /** @deprecated */
    overlayOpacity?: number;
    children?: React.ReactNode;
    /** Optional min-height; defaults to a comfortable hero block */
    minHeight?: string;
}

export default function PageHero({
    eyebrow,
    heading,
    description,
    children,
    minHeight,
}: PageHeroProps) {
    return (
        <section
            className={`relative overflow-hidden border-b border-border bg-hero-radial bg-topo ${minHeight ?? ""}`}
        >
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-24">
                <div className="max-w-3xl space-y-6">
                    {eyebrow && (
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="text-display-xl text-foreground">{heading}</h1>
                    {description && (
                        <p className="text-body-lg text-foreground-muted max-w-2xl">{description}</p>
                    )}
                    {children && <div className="pt-2">{children}</div>}
                </div>
            </div>
        </section>
    );
}
