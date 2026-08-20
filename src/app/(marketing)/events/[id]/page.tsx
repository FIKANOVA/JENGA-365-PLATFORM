import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fetchEventBySanityId } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import EventGallery from "@/components/marketing/events/EventGallery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EventDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
    const { id } = await params;
    const event = await fetchEventBySanityId(id);

    if (!event) {
        notFound();
    }

    const heroUrl = event.mainImage?.asset?.url
        ? urlFor(event.mainImage).width(1920).height(960).fit("crop").auto("format").url()
        : null;

    let formattedDate = "TBD";
    if (event.date) {
        try {
            const d = new Date(event.date);
            if (!isNaN(d.getTime())) formattedDate = format(d, "MMM d, yyyy");
        } catch {}
    }

    return (
        <div className="flex flex-col">
            <section className="relative overflow-hidden bg-hero-radial bg-topo border-b border-border">
                {heroUrl && (
                    <img
                        src={heroUrl}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover opacity-[0.18] pointer-events-none"
                    />
                )}
                <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-12 md:pt-20 pb-12 md:pb-24 lg:pt-28 lg:pb-28">
                    <div className="max-w-3xl space-y-6">
                        <p className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            {(event.type ?? "Community").replace(/_/g, " ")} · {formattedDate}
                        </p>
                        <h1 className="text-display-xl text-foreground">{event.title}</h1>
                        {event.location && (
                            <p className="text-body-lg text-foreground-muted">{event.location}</p>
                        )}
                        {event.registrationLink && (
                            <a
                                href={event.registrationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-11 items-center gap-2 rounded-md px-5 text-label font-medium text-white"
                                style={{ background: "var(--brand-green)" }}
                            >
                                Register
                            </a>
                        )}
                    </div>
                </div>
            </section>

            <EventGallery gallery={event.gallery ?? []} />
        </div>
    );
}
