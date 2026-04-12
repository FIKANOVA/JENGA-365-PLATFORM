"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "premium" | "dark" | "white" | "black" | "symbol" | "text" | "branding";
type LogoTheme = "light" | "dark" | "premium" | "mono";

interface LogoProps {
    variant?: LogoVariant;
    theme?: LogoTheme;
    showText?: boolean;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
}

export default function Logo({
    variant = "premium",
    theme = "premium",
    showText = false,
    className,
    width,
    height,
    priority = false
}: LogoProps) {
    // ── Brand Text Logic ──────────────────────────────────────────────────────
    const renderText = (size: number) => {
        const textClass = cn(
            "font-serif italic font-black transition-colors",
            theme === "dark" ? "text-white" : "text-black",
            theme === "mono" ? (variant === "white" ? "text-white" : "text-black") : ""
        );

        return (
            <div className={cn(textClass, className)} style={{ fontSize: size }}>
                <span className="text-[var(--red)]">J</span>
                <span>enga36</span>
                <span className="text-[var(--primary-green)]">5</span>
            </div>
        );
    };

    if (variant === "text" || variant === "branding") {
        return renderText(height ? height * 0.4 : 24);
    }

    const logoMap: Record<Exclude<LogoVariant, "text" | "branding">, string> = {
        premium: "/assets/logos/jenga365-premium.png",
        dark: "/assets/logos/jenga365-dark.png",
        white: "/assets/logos/jenga365-mono-white.png",
        black: "/assets/logos/jenga365-mono-black.png",
        symbol: "/assets/logos/jenga365-symbol.png",
    };

    const defaultDimensions: Record<Exclude<LogoVariant, "text" | "branding">, { w: number; h: number }> = {
        premium: { w: 180, h: 48 },
        dark: { w: 180, h: 48 },
        white: { w: 180, h: 48 },
        black: { w: 180, h: 48 },
        symbol: { w: 48, h: 48 },
    };

    const dims = defaultDimensions[variant] || defaultDimensions.premium;

    return (
        <div className={cn("flex items-center gap-3", className)}>
            <Image
                src={logoMap[variant as keyof typeof logoMap]}
                alt="Jenga365"
                width={width || dims.w}
                height={height || dims.h}
                className="h-auto object-contain"
                style={{ height: height || "auto" }}
                priority={priority}
            />
            {showText && renderText(height ? height * 0.4 : 20)}
        </div>
    );
}
