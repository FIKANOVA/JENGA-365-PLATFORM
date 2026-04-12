"use client";

import Link from "next/link";

export default function OurPhilosophy() {
    return (
        <section className="bg-[var(--off-white,#F5F5F0)] py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-16">
                    <div className="h-px w-8 bg-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Our Philosophy</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
                    {/* Left — quote + body */}
                    <div className="lg:col-span-7 space-y-10">
                        <blockquote className="font-playfair font-black text-3xl md:text-4xl text-foreground leading-[1.15] border-l-4 border-primary pl-8">
                            "Building the <span className="italic text-primary">Total Athlete</span> requires nourishing the body, mind, and the community that sustains them."
                        </blockquote>

                        <p className="font-sans font-light text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                            Jenga365 was born from the realisation that athletic talent alone isn't enough to break cycles of poverty. We focus on the holistic ecosystem surrounding the player — connecting mentors, unlocking financial literacy, and stewarding the environments our athletes call home.
                        </p>

                        <Link
                            href="/impact"
                            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] font-bold text-primary border-b border-primary/40 pb-0.5 hover:border-primary transition-colors"
                        >
                            Read Our Foundation Paper
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                    </div>

                    {/* Right — Mission + Approach */}
                    <div className="lg:col-span-5 flex flex-col gap-0 border border-border divide-y divide-border">
                        <div className="p-8 md:p-10 space-y-4 group hover:bg-white transition-colors">
                            <h3 className="font-playfair font-black text-2xl text-foreground uppercase group-hover:text-primary transition-colors">
                                Mission
                            </h3>
                            <p className="font-sans font-light text-sm text-muted-foreground leading-relaxed">
                                To leverage the power of football as a catalyst for educational advancement and vocational stability across Kenya's urban centres.
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-black text-black font-mono text-[9px] uppercase tracking-widest font-bold hover:bg-black hover:text-white transition-all"
                            >
                                Join the Network
                            </Link>
                        </div>

                        <div className="p-8 md:p-10 space-y-4 group hover:bg-white transition-colors">
                            <h3 className="font-playfair font-black text-2xl text-foreground uppercase group-hover:text-primary transition-colors">
                                The Approach
                            </h3>
                            <p className="font-sans font-light text-sm text-muted-foreground leading-relaxed">
                                We integrate world-class coaching with mandatory mentorship and digital literacy programmes, ensuring every participant has a future — with or without a professional contract.
                            </p>
                            <Link
                                href="/mentors"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-mono text-[9px] uppercase tracking-widest font-bold hover:bg-primary transition-all"
                            >
                                Meet Our Mentors
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom stats strip */}
                <div className="mt-20 pt-12 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { val: "2023", label: "Year Founded" },
                        { val: "500+", label: "Mentees Onboarded" },
                        { val: "3", label: "Active City Hubs" },
                        { val: "7", label: "Countries Reached" },
                    ].map((s) => (
                        <div key={s.label}>
                            <p className="font-serif font-black text-4xl md:text-5xl text-foreground leading-none">{s.val}</p>
                            <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mt-2">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
