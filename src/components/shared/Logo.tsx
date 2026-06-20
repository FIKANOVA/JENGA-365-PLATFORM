import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoTone = "default" | "light" | "dark";
type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
    /** Wraps the wordmark in a Link to `/`. Defaults true; pass false for embeds (e.g. inside a Sheet). */
    asLink?: boolean;
    tone?: LogoTone;
    size?: LogoSize;
    className?: string;
}

/**
 * Jenga365 inline-SVG logo: orbit arcs + red/green dots + wordmark
 * (J red, "enga36" neutral, 5 green). Mirrors /public/jenga365-logo.svg.
 * Neutral parts use currentColor so the mark adapts to `tone` (white on dark
 * surfaces, foreground on light); the red/green accents stay fixed.
 *
 * Legacy props (`variant`, `theme`, `showText`, `width`, `height`, `priority`) are
 * silently accepted-and-ignored so call sites elsewhere in the codebase keep
 * compiling during the rollout.
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
    const toneClass =
        tone === "light"
            ? "text-white"
            : tone === "dark"
                ? "text-black dark:text-white"
                : "text-foreground";

    const sizeClass =
        size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";

    const textScale = size === "sm" ? "1.25rem" : size === "lg" ? "1.75rem" : "1.5rem";

    const mark = (
        <div className={cn("flex items-center gap-2", className)} aria-label="Jenga365">
            <img
                src="/assets/logos/jenga365-symbol-transparent.png"
                alt=""
                className={cn("w-auto object-contain", sizeClass)}
        <svg
            viewBox="0 0 300 96"
            className={cn("w-auto", sizeClass, toneClass, className)}
            fill="none"
            role="img"
            aria-label="Jenga365"
        >
            <path
                d="M40 28 A 150 85 0 0 1 252 22"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
                opacity={0.9}
            />
            <path
                d="M260 68 A 150 85 0 0 1 48 74"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
                opacity={0.9}
            />
            <span
                className={cn("font-bold ", toneClass)}
                style={{ fontSize: textScale, fontFamily: "var(--font-sans), system-ui, sans-serif" }}
            >
                Jenga365
            </span>
        </div>
    );

    if (!asLink) return mark;

    return (
        <Link
            href="/"
            aria-label="Jenga365 home"
            className="inline-flex items-center transition-opacity hover:opacity-80"
        >
            {mark}
        </Link>
    );
}
