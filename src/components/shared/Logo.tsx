"use client";

import Link from "next/link";
import Image from "next/image";
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

/**
 * Jenga365 Official Logo component.
 * Uses the official SVG from /public/assets/logos/Jenga365 logo.svg and /public/jenga365-logo.svg.
 */
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
    const sizeClass =
        size === "sm"
            ? "h-8 w-8 sm:h-9 sm:w-9"
            : size === "lg"
                ? "h-12 w-12 sm:h-14 sm:w-14"
                : size === "xl"
                    ? "h-16 w-16 sm:h-20 sm:w-20"
                    : "h-9 w-9 sm:h-10 sm:w-10";

    const logoElement = (
        <div className={cn("inline-flex items-center justify-center shrink-0", className)}>
            <img
                src="/assets/logos/Jenga365%20logo.svg"
                alt="Jenga365 Logo"
                className={cn(
                    sizeClass,
                    "w-auto object-contain transition-transform duration-200 hover:scale-[1.03]",
                )}
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
