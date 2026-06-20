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
        size === "sm"
            ? "text-lg"
            : size === "lg"
              ? "text-2xl"
              : "text-xl";

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
