"use client";

import { useEffect, useRef, useState } from "react";

// Official Cloudflare test site key (always passes on localhost / test environments)
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

    const configuredKey = siteKey || process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
    
    // Determine whether to load the widget:
    // On localhost, we can use TEST_SITE_KEY if no key is configured.
    // On remote/production domains without a key, auto-bypass to avoid blocking forms.
    const isLocalhost = typeof window !== "undefined" && (
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".localhost")
    );

    const effectiveSiteKey = configuredKey || (isLocalhost ? TEST_SITE_KEY : null);

    // If Turnstile is unconfigured on a deployed domain, auto-resolve immediately
    useEffect(() => {
        if (!effectiveSiteKey) {
            onSuccess("unconfigured-turnstile-token");
        }
    }, [effectiveSiteKey, onSuccess]);

    // Load the Turnstile script dynamically if we have a valid key
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
            onError?.("Failed to load spam verification script.");
            if (!configuredKey) {
                onSuccess("unconfigured-turnstile-token");
            }
        };
        document.head.appendChild(script);
    }, [effectiveSiteKey, configuredKey, onError, onSuccess]);

    // Render the widget once script is loaded and container is ready
    useEffect(() => {
        if (!scriptLoaded || !containerRef.current || !window.turnstile || !effectiveSiteKey) return;

        // Clean up any previously rendered widget
        if (widgetIdRef.current) {
            try {
                window.turnstile.remove(widgetIdRef.current);
            } catch {
                // ignore
            }
            widgetIdRef.current = null;
        }

        try {
            const id = window.turnstile.render(containerRef.current, {
                sitekey: effectiveSiteKey,
                action,
                theme,
                callback: (token: string) => {
                    onSuccess(token);
                },
                "error-callback": (code?: string) => {
                    console.warn("[Turnstile] Challenge error:", code);
                    onError?.(code ? `Turnstile error: ${code}` : "Spam check failed.");
                    if (!configuredKey) {
                        onSuccess("unconfigured-turnstile-token");
                    }
                },
                "expired-callback": () => {
                    onExpire?.();
                },
            });
            widgetIdRef.current = id;
        } catch (err) {
            console.error("[Turnstile] Render error:", err);
            if (!configuredKey) {
                onSuccess("unconfigured-turnstile-token");
            }
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
    }, [scriptLoaded, effectiveSiteKey, configuredKey, action, theme, onSuccess, onError, onExpire]);

    if (!effectiveSiteKey) {
        return null;
    }

    return (
        <div className={className}>
            <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
        </div>
    );
}
