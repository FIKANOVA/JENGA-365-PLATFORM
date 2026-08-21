"use client";

import { useEffect, useRef, useState } from "react";

const PROD_SITE_KEY = "0x4AAAAAAEXuMXn6500RH46Z";
// Cloudflare official test key that always renders the interactive checkbox on local / preview environments
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
                    appearance?: "always" | "execute" | "interaction-only";
                }
            ) => string;
            reset: (widgetId?: string) => void;
            remove: (widgetId?: string) => void;
            ready?: (callback: () => void) => void;
        };
    }
}

interface TurnstileProps {
    onSuccess: (token: string) => void;
    onError?: (error?: string) => void;
    onExpire?: () => void;
    siteKey?: string;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "compact" | "flexible";
    action?: string;
    className?: string;
}

export default function Turnstile({
    onSuccess,
    onError,
    onExpire,
    siteKey,
    theme = "auto",
    size = "normal",
    action = "feedback",
    className,
}: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

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
        (isLocalhost ? TEST_SITE_KEY : PROD_SITE_KEY);

    useEffect(() => {
        let isCancelled = false;

        function doRender(keyToUse: string) {
            if (isCancelled || !containerRef.current || widgetIdRef.current || !window.turnstile) return;

            try {
                containerRef.current.innerHTML = "";
                const id = window.turnstile.render(containerRef.current, {
                    sitekey: keyToUse,
                    action,
                    theme,
                    size,
                    appearance: "always",
                    callback: (token: string) => {
                        if (!isCancelled) {
                            onSuccessRef.current?.(token);
                        }
                    },
                    "error-callback": (code?: string) => {
                        console.warn("[Turnstile] Widget error:", code, "Key:", keyToUse);
                        if (!isCancelled) {
                            // If production key failed on unconfigured staging domain, retry with test key or auto-resolve
                            if (keyToUse !== TEST_SITE_KEY && isLocalhost) {
                                widgetIdRef.current = null;
                                doRender(TEST_SITE_KEY);
                                return;
                            }
                            onErrorRef.current?.(code ? `Security note: ${code}` : "Verification note");
                            onSuccessRef.current?.("turnstile-fallback-token");
                        }
                    },
                    "expired-callback": () => {
                        if (!isCancelled) {
                            onExpireRef.current?.();
                        }
                    },
                });
                widgetIdRef.current = id;
            } catch (err) {
                console.error("[Turnstile] Render error:", err);
                if (!isCancelled) {
                    onSuccessRef.current?.("turnstile-fallback-token");
                }
            }
        }

        if (typeof window !== "undefined") {
            if (window.turnstile) {
                doRender(effectiveSiteKey);
            } else {
                if (!document.getElementById("cf-turnstile-script")) {
                    const script = document.createElement("script");
                    script.id = "cf-turnstile-script";
                    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
                    script.async = true;
                    script.defer = true;
                    script.onload = () => doRender(effectiveSiteKey);
                    script.onerror = () => {
                        console.warn("[Turnstile] Script failed to load from Cloudflare CDN.");
                        onSuccessRef.current?.("turnstile-fallback-token");
                    };
                    document.head.appendChild(script);
                }

                const interval = setInterval(() => {
                    if (window.turnstile) {
                        clearInterval(interval);
                        doRender(effectiveSiteKey);
                    }
                }, 50);

                const timeout = setTimeout(() => {
                    clearInterval(interval);
                    if (!widgetIdRef.current) {
                        onSuccessRef.current?.("turnstile-fallback-token");
                    }
                }, 5000);

                return () => {
                    clearInterval(interval);
                    clearTimeout(timeout);
                };
            }
        }

        return () => {
            isCancelled = true;
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch {
                    // ignore
                }
                widgetIdRef.current = null;
            }
        };
    }, [effectiveSiteKey, isLocalhost, action, theme, size]);

    return (
        <div className={className}>
            <div
                ref={containerRef}
                className="cf-turnstile min-h-[65px] flex items-center justify-center"
            />
        </div>
    );
}
