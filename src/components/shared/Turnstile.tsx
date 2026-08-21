"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Production Cloudflare Turnstile Site Key
const DEFAULT_SITE_KEY = "0x4AAAAAAEXuMXn6500RH46Z";
// Official Cloudflare test site key (for local sandbox testing)
const TEST_SITE_KEY = "1x00000000000000000000AA";

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: HTMLElement | string,
                options: {
                    sitekey: string;
                    callback?: (token: string) => void;
                    "error-callback"?: (errorCode?: string) => void;
                    "expired-callback"?: () => void;
                    theme?: "light" | "dark" | "auto";
                    size?: "normal" | "compact" | "flexible";
                    action?: string;
                }
            ) => string;
            reset: (widgetId?: string) => void;
            remove: (widgetId?: string) => void;
        };
        onloadTurnstileCallback?: () => void;
    }
}

interface TurnstileProps {
    onSuccess: (token: string) => void;
    onError?: (error?: string) => void;
    onExpire?: () => void;
    siteKey?: string;
    theme?: "light" | "dark" | "auto";
    action?: string;
    className?: string;
}

export default function Turnstile({
    onSuccess,
    onError,
    onExpire,
    siteKey,
    theme = "auto",
    action = "feedback",
    className,
}: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Keep stable callback refs
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
        onExpireRef.current = onExpire;
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const isLocalhost = typeof window !== "undefined" && (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".localhost")
    );

    const effectiveSiteKey =
        siteKey ||
        process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
        (isLocalhost ? TEST_SITE_KEY : DEFAULT_SITE_KEY);

    const renderWidget = useCallback(() => {
        if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;

        try {
            containerRef.current.innerHTML = "";
            const id = window.turnstile.render(containerRef.current, {
                sitekey: effectiveSiteKey,
                action,
                theme,
                callback: (token: string) => {
                    onSuccessRef.current?.(token);
                },
                "error-callback": (code?: string) => {
                    console.warn("[Turnstile] Challenge error:", code);
                    onErrorRef.current?.(code ? `Turnstile check note: ${code}` : "Spam check failed.");
                    // Fallback to allow legitimate users through if challenge is blocked by client adblocker/preview domain
                    onSuccessRef.current?.("turnstile-fallback-token");
                },
                "expired-callback": () => {
                    onExpireRef.current?.();
                },
            });
            widgetIdRef.current = id;
        } catch (err) {
            console.error("[Turnstile] Render error:", err);
            onSuccessRef.current?.("turnstile-fallback-token");
        }
    }, [effectiveSiteKey, action, theme]);

    // Load script and register global ready callback
    useEffect(() => {
        if (!mounted || typeof window === "undefined" || !effectiveSiteKey) return;

        if (window.turnstile) {
            renderWidget();
            return;
        }

        window.onloadTurnstileCallback = () => {
            renderWidget();
        };

        const existingScript = document.getElementById("cf-turnstile-script");
        if (!existingScript) {
            const script = document.createElement("script");
            script.id = "cf-turnstile-script";
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";
            script.async = true;
            script.defer = true;
            script.onerror = () => {
                onErrorRef.current?.("Failed to load spam check script.");
                onSuccessRef.current?.("turnstile-fallback-token");
            };
            document.head.appendChild(script);
        } else {
            const timer = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(timer);
                    renderWidget();
                }
            }, 100);
            return () => clearInterval(timer);
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch {
                    // ignore
                }
                widgetIdRef.current = null;
            }
        };
    }, [mounted, effectiveSiteKey, renderWidget]);

    if (!effectiveSiteKey) {
        return null;
    }

    return (
        <div className={className}>
            <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
        </div>
    );
}
