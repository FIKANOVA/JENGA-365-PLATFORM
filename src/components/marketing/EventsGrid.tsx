import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((event) => {
                const isRegistered = registeredEventIds.includes(event._id);

                return (
                    <div 
                        key={event._id} 
                        className="group flex flex-col bg-white border border-[var(--border)] transition-all duration-500 hover:border-black hover:shadow-2xl relative h-full rounded-sm overflow-hidden"
                    >
                        {/* ── Visual Area ── */}
                        <div className="relative aspect-[16/10] bg-[var(--off-white)] overflow-hidden">
                            {event.image ? (
                                <img 
                                    src={event.image} 
                                    alt={event.title} 
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 opacity-80" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-black/5 italic font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)]">
                                    No Visual Asset
                                </div>
                            )}
                            
                            {/* Type Badge */}
                            <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                                <span className="px-3 py-1 bg-white text-black font-mono text-[9px] uppercase tracking-[0.2em] font-bold shadow-xl rounded-sm border border-[var(--border)]">
                                    {event.isOnline ? "VIRTUAL SESSION" : "IN-PERSON"}
                                </span>
                                {isRegistered && (
                                    <span className="px-3 py-1 bg-[var(--green)] text-white font-mono text-[9px] uppercase tracking-[0.2em] font-bold shadow-xl rounded-sm">
                                        SECURED
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ── Content Area ── */}
                        <div className="p-10 flex-1 flex flex-col space-y-6 bg-white">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--primary-green)]">
                                        {event.type}
                                    </span>
                                    <span className="w-4 h-px bg-[var(--border)]"></span>
                                    <span className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-bold">
                                        {format(new Date(event.date), "MMM d, yyyy")}
                                    </span>
                                </div>

                                <h3 className="font-serif font-black text-2xl text-black leading-tight line-clamp-2 min-h-[2.8em] group-hover:text-[var(--primary-green)] transition-colors duration-500 uppercase tracking-tighter">
                                    {event.title}
                                </h3>
                                
                                <p className="text-[var(--text-secondary)] text-[13px] font-light leading-relaxed line-clamp-2">
                                    {event.description}
                                </p>
                            </div>

                            <div className="pt-8 border-t border-[var(--border)]">
                                <Link 
                                    href={`/events/${event._id}`}
                                    className={`w-full h-14 flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-widest font-bold transition-all rounded-sm shadow-sm ${
                                        isRegistered 
                                        ? 'bg-[var(--off-white)] text-black hover:bg-black hover:text-white' 
                                        : 'bg-black text-white hover:bg-[var(--primary-green)]'
                                    }`}
                                >
                                    {isRegistered ? "VIEW SESSION" : "RESERVE SEAT"}
                                    <span className="material-symbols-outlined text-[18px]">
                                        {isRegistered ? 'arrow_forward' : 'event_seat'}
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
