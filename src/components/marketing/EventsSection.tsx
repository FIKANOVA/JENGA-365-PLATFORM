"use client";

import NextLink from "next/link";
import { useSession } from "@/lib/auth/client";
import { format } from "date-fns";
import { MapPin, ArrowRight, Calendar } from "lucide-react";

interface JenEvent {
    _id: string;
    title: string;
    type?: string;
    date: string;
    location?: string;
    isOnline?: boolean;
    description?: string;
    image?: string;
}

const FALLBACK_EVENTS: JenEvent[] = [
    {
        _id: "e1",
        title: "Total Athlete Summit — Nairobi 2026",
        type: "Conference",
        date: new Date(Date.now() + 14 * 86400000).toISOString(),
        location: "KICC, Nairobi",
        isOnline: false,
        description: "Our flagship annual summit bringing together mentors, athletes, and corporate partners.",
    },
    {
        _id: "e2",
        title: "Financial Literacy Workshop for Athletes",
        type: "Workshop",
        date: new Date(Date.now() + 21 * 86400000).toISOString(),
        location: "Online (Zoom)",
        isOnline: true,
        description: "A practical 3-hour workshop on budgeting, savings, and investment basics.",
    },
    {
        _id: "e3",
        title: "Mentor Matching Open Day",
        type: "Networking",
        date: new Date(Date.now() + 35 * 86400000).toISOString(),
        location: "Strathmore University, Nairobi",
        isOnline: false,
        description: "Meet potential mentors face-to-face and begin your Jenga365 mentorship journey.",
    },
];

interface EventsSectionProps {
    events?: JenEvent[];
}

export default function EventsSection({ events = [] }: EventsSectionProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const displayEvents = (events && events.length > 0 ? events : FALLBACK_EVENTS).slice(0, 3);

    return (
        <section className="bg-background" style={{ background: "var(--surface-1)" }}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 md:py-24 md:py-32">
                <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
                    <div className="max-w-xl">
                        <span className="text-eyebrow" style={{ color: "var(--brand-green)" }}>
                            Upcoming Events
                        </span>
                        <h2 className="mt-3 text-display-md">Join the community in person.</h2>
                    </div>
                    <NextLink
                        href="/events"
                        className="inline-flex items-center gap-1.5 text-label font-medium hover:underline underline-offset-4"
                        style={{ color: "var(--foreground)" }}
                    >
                        View all events
                        <ArrowRight className="h-4 w-4" />
                    </NextLink>
                </div>

                <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-6 md:pb-0 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {displayEvents.map((event) => {
                        const dateObj = new Date(event.date);
                        const day = format(dateObj, "dd");
                        const month = format(dateObj, "MMM").toUpperCase();
                        return (
                            <article
                                key={event._id}
                                className="group flex flex-col rounded-lg border border-border bg-background overflow-hidden transition-shadow hover:shadow-lg min-w-[85vw] md:min-w-0 snap-center shrink-0"
                            >
                                <div className="relative h-44 overflow-hidden" style={{ background: "var(--surface-2)" }}>
                                    {event.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            src={event.image}
                                            alt={event.title}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center" style={{ color: "var(--foreground-subtle)" }}>
                                            <Calendar className="h-10 w-10" aria-hidden />
                                        </div>
                                    )}
                                    <div
                                        className="absolute top-3 left-3 rounded-md px-2.5 py-1.5 text-center shadow"
                                        style={{ background: "var(--background)" }}
                                    >
                                        <div className="text-headline leading-none" style={{ color: "var(--brand-green)" }}>{day}</div>
                                        <div className="text-eyebrow mt-0.5" style={{ color: "var(--foreground-muted)" }}>{month}</div>
                                    </div>
                                    {event.isOnline && (
                                        <span
                                            className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                                            style={{ background: "var(--brand-black)", color: "#fff" }}
                                        >
                                            Online
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 p-6 gap-3">
                                    {event.type && (
                                        <span className="text-eyebrow" style={{ color: "var(--foreground-muted)" }}>{event.type}</span>
                                    )}
                                    <h3 className="text-headline line-clamp-2" style={{ color: "var(--foreground)" }}>
                                        {event.title}
                                    </h3>
                                    {event.location && (
                                        <div className="flex items-center gap-1.5 text-body-sm" style={{ color: "var(--foreground-muted)" }}>
                                            <MapPin className="h-3.5 w-3.5" aria-hidden />
                                            {event.location}
                                        </div>
                                    )}
                                    <NextLink
                                        href={isAuthenticated ? `/dashboard/events/${event._id}` : "/register"}
                                        className="mt-auto inline-flex items-center justify-center h-10 px-4 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90"
                                        style={{ background: "var(--brand-black)" }}
                                    >
                                        Register
                                        <ArrowRight className="h-4 w-4 ml-1.5" />
                                    </NextLink>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
