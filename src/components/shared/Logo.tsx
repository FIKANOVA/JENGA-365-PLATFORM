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

    const mark = (
        <span
            className={cn(
                "font-sans font-bold tracking-tight inline-flex items-baseline gap-0",
                sizeClass,
                toneClass,
                className,
            )}
            style={{ letterSpacing: "-0.02em" }}
        >
            <span>Jenga</span>
            <span style={{ color: "var(--brand-green)" }}>365</span>
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
