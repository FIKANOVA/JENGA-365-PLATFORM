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
 * Jenga365 wordmark — pure text per DESIGN.md §10.
 * No image files. Replace with custom SVG when ready (update only this component).
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
              ? "text-zinc-950"
              : "text-foreground";

    const sizeClass =
        size === "sm"
            ? "text-lg"
            : size === "lg"
              ? "text-2xl"
              : "text-xl";

    // Kenya flag bands across "Jenga": black, white, red, white, green. "365" stays green.
    const KENYA_FLAG = ["#1A1A1A", "#FFFFFF", "#BB0000", "#FFFFFF", "#006600"];
    // Outline must contrast the background: light hairline on dark surfaces (so the
    // black band shows), dark hairline on light surfaces (so the white bands show).
    const strokeColor = tone === "light" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.5)";
    const mark = (
        <span
            className={cn(
                "font-sans font-bold tracking-tight inline-flex items-baseline gap-0",
                sizeClass,
                toneClass,
                className,
            )}
            style={{ letterSpacing: "-0.02em", WebkitTextStroke: `0.6px ${strokeColor}`, paintOrder: "stroke fill" }}
        >
            {"Jenga".split("").map((ch, i) => (
                <span key={i} style={{ color: KENYA_FLAG[i] }}>
                    {ch}
                </span>
            ))}
            <span style={{ color: "#006600" }}>365</span>
        </span>
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
