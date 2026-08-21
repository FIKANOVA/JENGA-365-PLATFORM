"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useFeedback } from "./FeedbackContext";

export default function BetaBanner() {
    const { openFeedback } = useFeedback();
    const [isRendered, setIsRendered] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Slide down 2 seconds after the user starts navigating the site
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsRendered(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (isDismissed) {
        return null;
    }

    return (
        <aside
            aria-label="Beta Announcement"
            className={`relative z-40 w-full bg-[#0D1F15] text-[#E4EDE7] border-b border-[#1C3E2B]/80 transition-all duration-700 ease-out overflow-hidden ${
                isRendered
                    ? "max-h-14 opacity-100 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-full pointer-events-none"
            }`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-1 sm:py-1.5 flex items-center justify-between gap-3 text-[11px] sm:text-xs">
                {/* Center / Message container */}
                <div className="flex-1 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#14422B] text-[#4ADE80] border border-[#235E3E]">
                        <Sparkles className="w-2.5 h-2.5" />
                        Beta
                    </span>
                    <span className="text-[#C8D6CD] text-[11px] sm:text-xs">
                        Jenga365 is in beta — continuous improvements are underway.
                    </span>
                    <button
                        type="button"
                        onClick={() => openFeedback()}
                        className="inline-flex items-center gap-1 font-medium text-[#4ADE80] hover:text-white underline underline-offset-2 transition-colors cursor-pointer text-[11px] sm:text-xs ml-1"
                    >
                        Share feedback
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => {
                        setIsRendered(false);
                        setTimeout(() => setIsDismissed(true), 700);
                    }}
                    aria-label="Dismiss beta banner"
                    className="shrink-0 p-0.5 rounded text-[#8FA89A] hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#4ADE80] cursor-pointer"
                    title="Dismiss"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </aside>
    );
}
