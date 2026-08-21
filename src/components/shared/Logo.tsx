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
    const sizeHeightClass =
        size === "sm"
            ? "h-8 sm:h-9"
            : size === "lg"
                ? "h-14 sm:h-16 md:h-20"
                : size === "xl"
                    ? "h-20 sm:h-24 md:h-28"
                    : "h-11 sm:h-12 md:h-14";

    const logoElement = (
        <div className={cn("inline-flex items-center justify-center shrink-0", sizeHeightClass, className)}>
            <img
                src="/assets/logos/Jenga365%20logo.svg"
                alt="Jenga365 Logo"
                className="h-full w-auto max-w-full object-contain transition-transform duration-200 hover:scale-[1.02]"
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
            className="inline-flex items-center transition-opacity hover:opacity-90 focus:outline-none"
        >
            {logoElement}
        </Link>
    );
}
