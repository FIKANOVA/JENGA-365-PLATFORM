import { urlFor } from "@/lib/sanity/client";

interface GalleryImage {
    _key?: string;
    asset?: { _id?: string; url?: string };
    alt?: string;
    caption?: string;
}

interface EventGalleryProps {
    readonly gallery: GalleryImage[];
}

export default function EventGallery({ gallery }: EventGalleryProps) {
    const items = gallery.filter((g) => g.asset?.url);
    if (items.length === 0) return null;

    return (
        <section className="py-20 lg:py-24 bg-background border-b border-border">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
                <div className="space-y-3">
                    <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                        Gallery
                    </span>
                    <h2 className="text-display-lg text-foreground">From the session</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((image, i) => {
                        const url = urlFor(image).width(800).height(800).fit("crop").auto("format").url();
                        return (
                            <figure
                                key={image._key ?? `${image.asset?._id ?? i}`}
                                className="group flex flex-col overflow-hidden rounded-md border border-border bg-[var(--surface-1)]"
                            >
                                <div className="aspect-square overflow-hidden bg-black/5">
                                    <img
                                        src={url}
                                        alt={image.alt ?? ""}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                {image.caption && (
                                    <figcaption className="px-4 py-3 text-body-sm text-foreground-muted">
                                        {image.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
