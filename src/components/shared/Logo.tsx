import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoTone = "default" | "light" | "dark";
type LogoSize = "sm" | "md" | "lg";
type LogoType = "text" | "image";

interface LogoProps {
    /** Wraps the wordmark in a Link to `/`. Defaults true; pass false for embeds (e.g. inside a Sheet). */
    asLink?: boolean;
    tone?: LogoTone;
    size?: LogoSize;
    type?: LogoType;
    className?: string;
}

/**
 * Jenga365 logo — now supports both exact text recreation and image.
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
    type = "text",
    className,
    width,
    height,
    priority,
}: LogoProps & LegacyProps) {
    const sizeClass =
        size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";

    const engaToneClass =
        tone === "light"
            ? "text-white"
            : tone === "dark"
              ? "text-black"
              : "text-black dark:text-white";

    const mark = type === "image" ? (
        <Image
            src="/assets/logos/logo.png"
            alt="Jenga365 Logo"
            width={width || (size === "lg" ? 48 : size === "md" ? 32 : 24)}
            height={height || (size === "lg" ? 48 : size === "md" ? 32 : 24)}
            className={cn("object-contain", className)}
            priority={priority}
        />
    ) : (
        <span
            className={cn(
                "font-sans font-bold tracking-tight inline-flex items-baseline gap-0",
                sizeClass,
                className,
            )}
            style={{ letterSpacing: "-0.02em" }}
        >
            <span style={{ color: "var(--brand-red)" }}>J</span>
            <span className={engaToneClass}>enga</span>
            <span style={{ color: "var(--brand-green)" }}>365</span>
        </span>
    // Kenya flag bands across "Jenga": black, white, red, white, green. "365" stays green.
    const KENYA_FLAG = ["#1A1A1A", "#FFFFFF", "#BB0000", "#FFFFFF", "#006600"];
    // Outline must contrast the background: light hairline on dark surfaces (so the
    // black band shows), dark hairline on light surfaces (so the white bands show).
    const strokeColor = tone === "light" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.5)";
    const mark = (
        <svg
            viewBox="0 0 300 96"
            className={cn("w-auto", sizeClass, toneClass, className)}
            fill="none"
            role="img"
            aria-label="Jenga365"
        >
            <path
                d="M40 28 A 150 62 0 0 1 252 22"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
                opacity={0.9}
            />
            <path
                d="M260 68 A 150 62 0 0 1 48 74"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                fill="none"
                opacity={0.9}
            />
            <circle cx={40} cy={28} r={7} fill="#E5342A" />
            <circle cx={260} cy={68} r={7} fill="#16A34A" />
            <text
                x={150}
                y={63}
                textAnchor="middle"
                fontWeight={700}
                fontSize={46}
                style={{ fontFamily: "var(--font-sans), system-ui, sans-serif", letterSpacing: "-1.5px" }}
            >
                <tspan fill="#E5342A">J</tspan>
                <tspan fill="currentColor">enga36</tspan>
                <tspan fill="#16A34A">5</tspan>
            </text>
        </svg>
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
