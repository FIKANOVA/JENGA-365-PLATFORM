"use client";

import { useEffect, useRef, useState } from "react";

// Production Cloudflare Turnstile Site Key
const DEFAULT_SITE_KEY = "0x4AAAAAAEXuMXn6500RH46Z";
// Official Cloudflare test site key (always passes on local test environments)
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
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
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
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Keep stable callback refs to prevent re-rendering/destroying widget on parent state changes
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
        onSuccessRef.current = onSuccess;
        onErrorRef.current = onError;
        onExpireRef.current = onExpire;
    });

    const isLocalhost = typeof window !== "undefined" && (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".localhost")
    );

    const effectiveSiteKey =
        siteKey ||
        process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
        (isLocalhost ? TEST_SITE_KEY : DEFAULT_SITE_KEY);

    // Load the Turnstile script dynamically
    useEffect(() => {
        if (typeof window === "undefined" || !effectiveSiteKey) return;

        if (window.turnstile) {
            setScriptLoaded(true);
            return;
        }

        const existingScript = document.getElementById("cf-turnstile-script");
        if (existingScript) {
            const checkInterval = setInterval(() => {
                if (window.turnstile) {
                    setScriptLoaded(true);
                    clearInterval(checkInterval);
                }
            }, 100);
            return () => clearInterval(checkInterval);
        }

        const script = document.createElement("script");
        script.id = "cf-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            setScriptLoaded(true);
        };
        script.onerror = () => {
            onErrorRef.current?.("Failed to load spam verification script.");
        };
        document.head.appendChild(script);
    }, [effectiveSiteKey]);

    // Render the widget once script is loaded and container is ready
    useEffect(() => {
        if (!scriptLoaded || !containerRef.current || !window.turnstile || !effectiveSiteKey) return;

        // If widget already rendered for this container, don't re-render
        if (widgetIdRef.current) {
            return;
        }

        try {
            const id = window.turnstile.render(containerRef.current, {
                sitekey: effectiveSiteKey,
                action,
                theme,
                callback: (token: string) => {
                    onSuccessRef.current(token);
                },
                "error-callback": (code?: string) => {
                    console.warn("[Turnstile] Challenge error:", code);
                    onErrorRef.current?.(code ? `Turnstile error: ${code}` : "Spam check failed.");
                },
                "expired-callback": () => {
                    onExpireRef.current?.();
                },
            });
            widgetIdRef.current = id;
        } catch (err) {
            console.error("[Turnstile] Render error:", err);
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
    }, [scriptLoaded, effectiveSiteKey, action, theme]);

    if (!effectiveSiteKey) {
        return null;
    }

    return (
        <div className={className}>
            <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
        </div>
    );
}
