"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useFeedback } from "./FeedbackContext";

export default function BetaBanner() {
    const { openFeedback } = useFeedback();
    const [isRendered, setIsRendered] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    // Slide down after 1.5 seconds so user notices it smoothly
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsRendered(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (isDismissed) {
        return null;
    }

    return (
        <aside
            aria-label="Beta Announcement"
            className={`relative z-50 w-full bg-[#0D1F15] text-[#E4EDE7] border-b border-[#1C3E2B]/80 transition-all duration-500 ease-out ${
                isRendered
                    ? "max-h-32 opacity-100 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-full pointer-events-none overflow-hidden"
            }`}
        >
            <div className="relative mx-auto max-w-7xl px-8 sm:px-12 py-1.5 sm:py-2 flex items-center justify-center text-[11px] sm:text-xs">
                {/* Center / Message container */}
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#14422B] text-[#4ADE80] border border-[#235E3E]">
                        <Sparkles className="w-2.5 h-2.5" />
                        Beta
                    </span>
                    <span className="text-[#C8D6CD] text-[11px] sm:text-xs font-normal">
                        Jenga365 is in beta — continuous improvements are underway.
                    </span>
                    <button
                        type="button"
                        onClick={() => openFeedback()}
                        className="inline-flex items-center gap-1 font-semibold text-[#4ADE80] hover:text-white underline underline-offset-2 transition-colors cursor-pointer text-[11px] sm:text-xs ml-1"
                    >
                        Share feedback
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {/* Cancel / Close Icon at far right end — prominent, touch-friendly, never hidden */}
                <button
                    type="button"
                    onClick={() => {
                        setIsRendered(false);
                        setTimeout(() => setIsDismissed(true), 500);
                    }}
                    aria-label="Dismiss beta banner"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-[#A3BFB0] hover:text-white hover:bg-white/15 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#4ADE80] cursor-pointer"
                    title="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </aside>
    );
}
