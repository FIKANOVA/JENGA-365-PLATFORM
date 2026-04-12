"use client";

import { TrendingUp, School, Check, ChevronRight, MapPin, Download, Database, Plus } from "lucide-react";

interface CsrStats {
    menteesSponsored: number;
    activeMentorships: number;
    donationsTotal: number;
    projectsFunded: number;
}

interface MentorUser {
    id: string;
    name: string | null;
    image: string | null;
}

interface EventRow {
    id: string;
    title: string;
    date: Date;
    location: string | null;
    isOnline: boolean | null;
    type: string;
}

interface PartnerDashboardProps {
    company?: string;
    tier?: string | null;
    csrStats?: CsrStats | null;
    mentors?: MentorUser[];
    upcomingEvents?: EventRow[];
}

export default function PartnerDashboard({
    company = "Your Organisation",
    tier = "Partner",
    csrStats = null,
    mentors = [],
    upcomingEvents = [],
}: PartnerDashboardProps) {
    const metrics = [
        {
            label: "Mentees Sponsored",
            value: csrStats ? String(csrStats.menteesSponsored) : "—",
            change: csrStats ? "Live data" : "No partner linked",
            icon: TrendingUp,
        },
        {
            label: "Active Mentorships",
            value: csrStats ? String(csrStats.activeMentorships) : "—",
            change: csrStats ? "Live data" : "No partner linked",
            icon: TrendingUp,
        },
        {
            label: "Total Donations",
            value: csrStats ? `KES ${csrStats.donationsTotal.toLocaleString()}` : "—",
            change: csrStats ? "Live data" : "No partner linked",
            icon: School,
        },
    ];

    return (
        <div className="flex-1 bg-background h-full overflow-y-auto">
            <div className="max-w-6xl mx-auto p-6 md:p-8 flex flex-col gap-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/50 pb-6">
                    <h2 className="font-playfair font-bold text-2xl text-foreground flex items-center gap-2 tracking-tight">
                        <span className="w-1.5 h-6 bg-[#996600] inline-block" />
                        {company} Impact Portal
                    </h2>
                    <div className="flex gap-4 items-center">
                        <div className="text-right sm:text-left">
                            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Partner Level</p>
                            <p className="font-bold text-[#996600]">{tier ?? "Partner"}</p>
                        </div>
                    </div>
                </header>

                {/* Impact Metrics */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {metrics.map((metric, i) => (
                        <div key={i} className="border border-border/50 rounded-lg p-6 bg-card relative overflow-hidden group shadow-sm hover:border-[#996600] transition-colors">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#996600]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                            <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">{metric.label}</p>
                            <p className="font-playfair font-black text-[28px] text-foreground">{metric.value}</p>
                            <div className="mt-4 flex items-center gap-2 text-sm text-kenya-green">
                                <TrendingUp className="w-4 h-4" />
                                <span>{metric.change}</span>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Sponsored Mentors */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-playfair font-bold text-xl text-foreground">
                                Your Mentors ({mentors.length})
                            </h3>
                            <button className="text-sm font-mono text-primary hover:underline outline-none">View All</button>
                        </div>

                        {mentors.length === 0 ? (
                            <div className="border border-dashed border-border/50 rounded-lg p-8 text-center text-sm text-muted-foreground font-mono">
                                No mentors linked to this partner yet.
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {mentors.map((mentor) => (
                                    <div key={mentor.id} className="flex flex-col items-center min-w-[80px]">
                                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground border-2 border-transparent hover:border-primary transition-colors cursor-pointer mb-2">
                                            {(mentor.name ?? "?").charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-xs font-medium text-foreground text-center truncate w-full text-center">{mentor.name ?? "—"}</span>
                                    </div>
                                ))}
                                <div className="flex flex-col items-center min-w-[80px] justify-center">
                                    <div className="w-14 h-14 rounded-full bg-muted border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary cursor-pointer transition-colors mb-2">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-medium text-muted-foreground text-center">Invite</span>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Upcoming Events */}
                    <section>
                        <h3 className="font-playfair font-bold text-xl text-foreground mb-6">Upcoming Partner Events</h3>
                        {upcomingEvents.length === 0 ? (
                            <div className="border border-dashed border-border/50 rounded-lg p-8 text-center text-sm text-muted-foreground font-mono">
                                No upcoming events.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {upcomingEvents.map((evt) => {
                                    const d = new Date(evt.date);
                                    return (
                                        <div key={evt.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-card hover:border-[#996600]/50 transition-colors cursor-pointer group shadow-sm">
                                            <div className="flex flex-col items-center justify-center w-12 h-12 bg-background rounded border border-border/50 text-primary shrink-0">
                                                <span className="text-xs font-mono font-bold uppercase">
                                                    {d.toLocaleString("en", { month: "short" })}
                                                </span>
                                                <span className="text-lg font-playfair font-black leading-none">{d.getDate()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">{evt.title}</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 font-mono">
                                                    <MapPin className="w-3 h-3" />
                                                    {evt.isOnline ? "Online" : (evt.location ?? "TBD")}
                                                </p>
                                            </div>
                                            <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors w-5 h-5" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer Reporting Section */}
                <section className="mt-4 border-t border-border/50 pt-8">
                    <div className="bg-card rounded-lg p-6 border border-border/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
                        <div>
                            <span className="text-primary font-mono text-[10px] uppercase tracking-widest font-bold mb-2 block">Impact Documentation</span>
                            <h3 className="font-playfair font-bold text-lg text-foreground tracking-tight">Need a detailed report?</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">Download your latest metrics or request specific data for your ESG reporting.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button className="px-4 py-2 bg-transparent border border-border/50 rounded font-mono text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" />
                                DOWNLOAD IMPACT REPORT
                            </button>
                            <button className="px-4 py-2 bg-transparent border border-border/50 rounded font-mono text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
                                <Database className="w-4 h-4" />
                                REQUEST CUSTOM EXPORT
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
