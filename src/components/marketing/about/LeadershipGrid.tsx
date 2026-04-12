"use client";

import Link from "next/link";

interface TeamMember {
    name: string;
    role: string;
    image?: string;
}

interface LeadershipGridProps {
    readonly team?: TeamMember[];
}

const fallbackTeam = [
    {
        name: "Peter Lugano",
        role: "EXECUTIVE DIRECTOR",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Barnabas Owuor",
        role: "TECHNICAL LEAD",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Sheila Chajira",
        role: "HEAD OF RUGBY",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Mark Dunford",
        role: "STRATEGY ADVISOR",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Roldie Tende",
        role: "OPERATIONS",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Bruce Odhiambo",
        role: "FINANCE DIRECTOR",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop"
    },
    {
        name: "Nyaenya Moseti",
        role: "TECH ADVISOR",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop"
    },
];

export default function LeadershipGrid({ team = fallbackTeam }: LeadershipGridProps) {
    return (
        <section className="py-40 bg-[var(--off-white)]">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="mb-24 space-y-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.6em] text-[var(--primary-green)] block font-bold">
                        The People
                    </span>
                    <h2 className="font-serif font-bold text-5xl md:text-6xl text-black uppercase tracking-tighter">
                        Architects of Change
                    </h2>
                    <p className="font-light text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                        Built with editorial heritage & technical precision by Kenya&apos;s finest sporting minds.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                    {team.map((member, index) => (
                        <div key={index} className="group flex flex-col space-y-8">
                            <div className="aspect-[3/4] overflow-hidden bg-black relative border border-black/5">
                                <img 
                                    src={member.image} 
                                    alt={member.name}
                                    className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>
                            
                            <div className="space-y-3">
                                <h3 className="font-serif font-bold text-3xl text-black uppercase tracking-tight group-hover:text-[var(--primary-green)] transition-colors duration-500">
                                    {member.name}
                                </h3>
                                <div className="h-px w-12 bg-[var(--primary-green)] group-hover:bg-[var(--red)] transition-colors duration-500 mb-4" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--primary-green)] font-bold block">
                                    {member.role}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
