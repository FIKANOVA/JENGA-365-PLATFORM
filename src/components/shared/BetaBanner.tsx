"use client";

import { useState } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useFeedback } from "./FeedbackContext";

export default function BetaBanner() {
    const { openFeedback } = useFeedback();
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
        return null;
    }

    return (
        <aside
            aria-label="Beta Announcement"
            className="relative z-40 w-full bg-[#0D1F15] text-[#E4EDE7] border-b border-[#1C3E2B] text-xs transition-all duration-300"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3">
                {/* Center / Message container */}
                <div className="flex-1 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#14422B] text-[#4ADE80] border border-[#235E3E]">
                        <Sparkles className="w-2.5 h-2.5" />
                        Beta
                    </span>
                    <span className="text-[#C8D6CD] text-[11px] sm:text-xs">
                        Jenga365 is in beta — we&apos;re continuously rolling out improvements.
                    </span>
                    <button
                        type="button"
                        onClick={() => openFeedback()}
                        className="inline-flex items-center gap-1 font-semibold text-[#4ADE80] hover:text-white underline underline-offset-2 transition-colors cursor-pointer text-[11px] sm:text-xs"
                    >
                        Share feedback
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => setIsVisible(false)}
                    aria-label="Dismiss beta banner"
                    className="shrink-0 p-1 rounded text-[#8FA89A] hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[#4ADE80] cursor-pointer"
                    title="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </aside>
    );
}

