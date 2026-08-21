"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoTone = "default" | "light" | "dark";
type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
    /** Wraps the logo in a Link to `/`. Defaults true; pass false for embeds (e.g. inside dialogs/sheets). */
    asLink?: boolean;
    tone?: LogoTone;
    size?: LogoSize;
    className?: string;
}

type LegacyProps = {
    variant?: string;
    theme?: string;
    showText?: boolean;
    width?: number;
    height?: number;
    priority?: boolean;
};

export default function Logo({
    asLink = true,
    tone = "default",
    size = "md",
    className,
}: LogoProps & LegacyProps) {
    const sizeDimensionsClass =
        size === "sm"
            ? "h-9 w-9 sm:h-10 sm:w-10"
            : size === "lg"
                ? "h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20"
                : size === "xl"
                    ? "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28"
                    : "h-12 w-12 sm:h-13 sm:w-13 md:h-14 md:w-14";

    const logoElement = (
        <div
            className={cn(
                "relative inline-flex items-center justify-center shrink-0 rounded-full aspect-square p-1 sm:p-1.5 transition-all duration-300",
                "bg-white/90 dark:bg-white/95 backdrop-blur-md border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]",
                sizeDimensionsClass,
                className
            )}
        >
            <img
                src="/assets/logos/Jenga365%20logo.svg"
                alt="Jenga365 Logo"
                className="h-full w-full object-contain transition-transform duration-200 hover:scale-[1.04] drop-shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                loading="eager"
            />
        </div>
    );

    if (!asLink) {
        return logoElement;
    }

    return (
        <Link
            href="/"
            aria-label="Jenga365 Home"
            className="inline-flex items-center rounded-full transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            {logoElement}
        </Link>
    );
}
