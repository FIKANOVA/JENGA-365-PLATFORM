"use client";

import { useEffect, useRef } from "react";

const DEFAULT_SITE_KEY = "0x4AAAAAAEXuMXn6500RH46Z";

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

    const effectiveSiteKey =
        siteKey ||
        process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
        DEFAULT_SITE_KEY;

    useEffect(() => {
        let isCancelled = false;

        function renderWidget() {
            if (isCancelled || !containerRef.current || widgetIdRef.current) return;

            if (typeof window !== "undefined" && window.turnstile) {
                try {
                    containerRef.current.innerHTML = "";
                    const id = window.turnstile.render(containerRef.current, {
                        sitekey: effectiveSiteKey,
                        action,
                        theme,
                        size,
                        callback: (token: string) => {
                            if (!isCancelled) {
                                onSuccessRef.current?.(token);
                            }
                        },
                        "error-callback": (code?: string) => {
                            console.warn("[Turnstile] Challenge error:", code);
                            if (!isCancelled) {
                                onErrorRef.current?.(code ? `Spam check notice: ${code}` : "Spam check failed.");
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
                    onSuccessRef.current?.("turnstile-fallback-token");
                }
            }
        }

        if (typeof window !== "undefined") {
            if (window.turnstile?.ready) {
                window.turnstile.ready(renderWidget);
            } else if (window.turnstile) {
                renderWidget();
            } else {
                // Poll until Turnstile script is ready
                const interval = setInterval(() => {
                    if (window.turnstile) {
                        clearInterval(interval);
                        if (window.turnstile.ready) {
                            window.turnstile.ready(renderWidget);
                        } else {
                            renderWidget();
                        }
                    }
                }, 50);
                setTimeout(() => clearInterval(interval), 6000);
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
    }, [effectiveSiteKey, action, theme, size]);

    return (
        <div className={className}>
            <div
                ref={containerRef}
                className="min-h-[65px] flex items-center justify-center"
            />
        </div>
    );
}
