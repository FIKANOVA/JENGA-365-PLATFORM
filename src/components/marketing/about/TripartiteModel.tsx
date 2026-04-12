"use client";

import Link from "next/link";

export default function TripartiteModel() {
    return (
        <section className="py-32 bg-accent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 md:gap-32 items-start">
                    {/* Left: Bold Quote */}
                    <div className="space-y-12">
                        <span className="section-label">Our Philosophy</span>
                        <h2 className="font-serif font-bold text-5xl md:text-5xl text-foreground leading-[1.1] uppercase tracking-tighter">
                            "Building the <span className="text-primary">Total <br />Athlete</span> requires nourishing the body, mind, and the community that sustains them."
                        </h2>
                    </div>

                    {/* Right: Mission & Approach */}
                    <div className="space-y-20">
                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <h3 className="font-serif font-bold text-2xl text-foreground uppercase tracking-tight">Mission</h3>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                            <p className="font-sans font-light text-xl text-muted-foreground leading-relaxed">
                                To empower players and coaches, we design the environment, the processes, and the technical templates needed to achieve excellence.
                            </p>
                            <Link href="/impact" className="btn-ghost inline-block border-b-primary pb-2 hover:border-secondary hover:text-secondary border-t-0 border-l-0 border-r-0">
                                Our Strategic Plan
                            </Link>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <h3 className="font-serif font-bold text-2xl text-foreground uppercase tracking-tight">The Approach</h3>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                            <p className="font-sans font-light text-xl text-muted-foreground leading-relaxed">
                                With integrated architecture and professional protocols, our engine provides recurring multi-dimensional impact with an ethical sponsorship strategy.
                            </p>
                            <Link href="/register" className="btn-primary inline-block bg-foreground text-background hover:bg-muted-foreground">
                                How We Work
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom descriptive paragraph */}
                <div className="mt-32 pt-16 border-t border-border">
                    <p className="font-sans font-light text-xl text-muted-foreground leading-relaxed max-w-4xl">
                        Jenga365 has been built from the ground up by experts in sport, business, and global development. We focus on the holistic success of both our athletes and the community surrounding them.
                    </p>
                </div>
            </div>
        </section>
    );
}
