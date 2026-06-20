"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function TripartiteModel() {
    return (
        <section className="py-12 md:py-24 bg-accent relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-start">
                    {/* Left: Bold Quote */}
                    <div className="space-y-8">
                        <span className="text-eyebrow text-foreground-muted">Our philosophy</span>
                        <h2 className="text-display-lg text-foreground leading-tight">
                            Building the{" "}
                            <span style={{ color: "var(--brand-green)" }}>Total Athlete</span>{" "}
                            requires nourishing the body, mind, and the community that sustains them.
                        </h2>
                    </div>

                    {/* Right: Mission & Approach */}
                    <div className="space-y-14">
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <h3 className="text-display-sm text-foreground">Mission</h3>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                            <p className="text-body-lg text-foreground-muted leading-relaxed">
                                To empower players and coaches, we design the environment, the processes, and the technical templates needed to achieve excellence.
                            </p>
                            <Link
                                href="/impact"
                                className="inline-flex items-center gap-2 text-label hover:underline"
                                style={{ color: "var(--brand-green)" }}
                            >
                                Our strategic plan <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <h3 className="text-display-sm text-foreground">The approach</h3>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                            <p className="text-body-lg text-foreground-muted leading-relaxed">
                                With integrated architecture and professional protocols, our engine provides recurring multi-dimensional impact with an ethical sponsorship strategy.
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 h-11 rounded-md px-5 text-label font-medium transition-opacity hover:opacity-90"
                                style={{ background: "var(--brand-green)", color: "var(--brand-green-fg)" }}
                            >
                                How we work <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom descriptive paragraph */}
                <div className="mt-24 pt-12 border-t border-border">
                    <p className="text-body-lg text-foreground-muted leading-relaxed max-w-4xl">
                        Jenga365 has been built from the ground up by experts in sport, business, and global development. We focus on the holistic success of both our athletes and the community surrounding them.
                    </p>
                </div>
            </div>
        </section>
    );
}
