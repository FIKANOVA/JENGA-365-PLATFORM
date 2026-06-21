import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight, Ticket } from "lucide-react";
import { useSession } from "@/lib/auth/client";

interface EventsGridProps {
    events: any[];
    /** Array of event IDs that the current user has already registered for */
    registeredEventIds?: string[];
}

export default function EventsGrid({ events, registeredEventIds = [] }: EventsGridProps) {
    const { data: session, isPending } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((event) => {
                const isRegistered = registeredEventIds.includes(event._id);

                if (event.lumaEventIframe) {
                    return (
                        <div 
                            key={event._id}
                            className="flex justify-center"
                            dangerouslySetInnerHTML={{ __html: event.lumaEventIframe }}
                        />
                    );
                }

                return (
                    <div 
                        key={event._id} 
                        className="group flex flex-col bg-background border border-border transition-all duration-500 hover:border-foreground/30 hover:shadow-2xl hover:-translate-y-1 relative h-full rounded-3xl overflow-hidden"
                    >
                        {/* ── Visual Area ── */}
                        <div className="relative aspect-[16/10] bg-[var(--surface-1)] overflow-hidden">
                            {event.image ? (
                                <img 
                                    src={event.image} 
                                    alt={event.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black/5 italic text-eyebrow text-[var(--foreground-subtle)]">
                                    No Visual Asset
                                </div>
                            )}
                            
                            {/* Type Badge */}
                            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                                <span className="px-3 py-1.5 bg-white text-black text-[10px] uppercase tracking-wider font-bold shadow-xl rounded-full border border-border">
                                    {event.isOnline ? "VIRTUAL SESSION" : "IN-PERSON"}
                                </span>
                                {isRegistered && (
                                    <span className="px-3 py-1.5 bg-[var(--brand-green)] text-white text-[10px] uppercase tracking-wider font-bold shadow-xl rounded-full">
                                        SECURED
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ── Content Area ── */}
                        <div className="p-6 md:p-8 flex-1 flex flex-col space-y-6">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-label font-bold text-[var(--brand-green)]">
                                        {event.type}
                                    </span>
                                    <span className="w-4 h-px bg-[var(--border)]"></span>
                                    <span className="text-label text-[var(--foreground-subtle)] font-semibold">
                                        {format(new Date(event.date), "MMM d, yyyy")}
                                    </span>
                                </div>

                                <h3 className="text-title text-foreground tracking-tight leading-snug line-clamp-2 min-h-[2.8em] group-hover:text-[var(--brand-green)] transition-colors duration-500">
                                    {event.title}
                                </h3>
                                
                                <p className="text-[var(--foreground-muted)] text-body-sm leading-relaxed line-clamp-2">
                                    {event.description}
                                </p>
                            </div>

                            <div className="pt-4 mt-auto">
                                <Link 
                                    href={`/events/${event._id}`}
                                    className={`group/btn w-full h-12 flex items-center justify-between pl-6 pr-1.5 gap-3 font-medium transition-all rounded-full shadow-sm ${
                                        isRegistered 
                                        ? 'bg-[var(--surface-2)] text-foreground hover:bg-[var(--surface-3)]' 
                                        : 'bg-foreground text-white hover:opacity-90'
                                    }`}
                                >
                                    {isRegistered ? "View Session" : "Reserve Seat"}
                                    <span className={`rounded-full p-2 flex items-center justify-center shadow-sm transition-transform duration-300 group-hover/btn:translate-x-1 ${isRegistered ? 'bg-white' : 'bg-white'}`}>
                                        {isRegistered ? <ArrowRight className="h-4 w-4 text-black" /> : <Ticket className="h-4 w-4 text-black" />}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
