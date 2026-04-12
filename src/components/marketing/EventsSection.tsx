"use client";

import NextLink from "next/link";
import { useSession } from "@/lib/auth/client";
import { format } from "date-fns";

const FALLBACK_EVENTS = [
    { _id: "e1", title: "Total Athlete Summit — Nairobi 2026", type: "CONFERENCE", date: new Date(Date.now() + 14 * 86400000).toISOString(), location: "KICC, Nairobi", isOnline: false, description: "Our flagship annual summit bringing together mentors, athletes, and corporate partners.", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800" },
    { _id: "e2", title: "Financial Literacy Workshop for Athletes", type: "WORKSHOP", date: new Date(Date.now() + 21 * 86400000).toISOString(), location: "Online (Zoom)", isOnline: true, description: "A practical 3-hour workshop on budgeting, savings, and investment basics for young athletes.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800" },
    { _id: "e3", title: "Mentor Matching Open Day", type: "NETWORKING", date: new Date(Date.now() + 35 * 86400000).toISOString(), location: "Strathmore University, Nairobi", isOnline: false, description: "Meet potential mentors face-to-face and begin your Jenga365 mentorship journey.", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800" },
];

interface EventsSectionProps {
    events?: any[];
}

export default function EventsSection({ events = [] }: EventsSectionProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const displayEvents = (events && events.length > 0 ? events : FALLBACK_EVENTS).slice(0, 3);

    return (
        <section className="bg-primary/5 py-20">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h4 className="text-primary font-bold uppercase tracking-widest text-sm mb-2 font-mono">Join Us</h4>
                        <h2 className="text-3xl md:text-5xl font-black text-foreground font-playfair uppercase">Upcoming Events</h2>
                    </div>
                    <NextLink href="/events" className="text-primary font-bold font-mono text-sm flex items-center gap-1 hover:underline">
                        View All <span className="hidden sm:inline">Events</span>
                        <span className="material-symbols-outlined text-[1.2rem]">chevron_right</span>
                    </NextLink>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {displayEvents.map((event) => {
                        const dateObj = new Date(event.date);
                        const day = format(dateObj, "dd");
                        const month = format(dateObj, "MMM");
                        return (
                            <div key={event._id} className="bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm group hover:shadow-md transition-shadow">
                                <div className="h-48 relative overflow-hidden">
                                    {event.image ? (
                                        <img
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            src={event.image}
                                            alt={event.title}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-black/5 italic font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                            No Visual Asset
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-primary text-white py-2 px-3 rounded shadow-lg text-center min-w-[50px]">
                                        <span className="block text-xl font-bold font-playfair">{day}</span>
                                        <span className="block text-xs uppercase font-bold font-mono tracking-wider">{month}</span>
                                    </div>
                                    {event.isOnline && (
                                        <span className="absolute top-4 right-4 bg-black/70 text-white font-mono text-[8px] uppercase tracking-widest px-2 py-1 rounded">
                                            Online
                                        </span>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col justify-between h-[180px]">
                                    <div>
                                        <h3 className="text-xl font-bold font-playfair mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">{event.title}</h3>
                                        <p className="text-muted-foreground font-sans text-sm flex items-center gap-1 line-clamp-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {event.location}
                                        </p>
                                    </div>
                                    <NextLink
                                        href={isAuthenticated ? `/dashboard/events/${event._id}` : "/register"}
                                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-black text-white font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-primary transition-all"
                                    >
                                        Register
                                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                    </NextLink>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
