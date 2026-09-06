"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "@/lib/auth/client";
import { toast } from "sonner";
import { Clock, ShieldAlert, LogOut, RefreshCw } from "lucide-react";

// Configurable constants
// Default: 15 minutes of idle time before automatic signout
const DEFAULT_IDLE_TIMEOUT_MINUTES = 15;
const IDLE_TIMEOUT_MS =
    (Number(process.env.NEXT_PUBLIC_SESSION_IDLE_TIMEOUT_MINUTES) || DEFAULT_IDLE_TIMEOUT_MINUTES) *
    60 *
    1000;

// Show warning countdown during the final 60 seconds of inactivity
const WARNING_DURATION_MS = 60 * 1000;
const STORAGE_KEY = "jenga365_last_activity_timestamp";
const THROTTLE_MS = 5000; // Update localStorage at most once every 5 seconds

export default function SessionIdleTimeout() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [showWarning, setShowWarning] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(60);

    const lastActivityRef = useRef<number>(Date.now());
    const isLoggingOutRef = useRef<boolean>(false);
    const throttleTimerRef = useRef<number>(0);
    const showWarningRef = useRef<boolean>(false);
    const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        showWarningRef.current = showWarning;
    }, [showWarning]);

    // Update activity timestamp locally and in localStorage
    const recordActivity = useCallback(() => {
        const now = Date.now();
        lastActivityRef.current = now;

        // Throttle writing to localStorage to prevent performance degradation
        if (now - throttleTimerRef.current > THROTTLE_MS) {
            throttleTimerRef.current = now;
            try {
                localStorage.setItem(STORAGE_KEY, String(now));
            } catch {
                // Ignore localStorage errors (e.g. private browsing storage limits)
            }
        }

        // If warning dialog is showing and user acts, dismiss warning
        if (showWarningRef.current) {
            setShowWarning(false);
        }
    }, []);

    // Handle logout due to inactivity
    const handleIdleLogout = useCallback(async () => {
        if (isLoggingOutRef.current) return;
        isLoggingOutRef.current = true;
        setShowWarning(false);

        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.setItem("jenga365_logout_broadcast", String(Date.now()));
        } catch {
            // ignore
        }

        try {
            await signOut();
        } catch (err) {
            console.error("[SessionIdleTimeout] Logout error:", err);
        } finally {
            toast.error("You have been signed out due to inactivity for security.");
            const currentCallback = encodeURIComponent(pathname || "/dashboard");
            const targetUrl = `/login?reason=idle_timeout&callbackUrl=${currentCallback}`;
            try {
                router.push(targetUrl);
            } catch {}
            if (typeof window !== "undefined") {
                window.location.href = targetUrl;
            }
        }
    }, [pathname, router]);

    // Extend session manually from warning modal
    const handleStayLoggedIn = () => {
        const now = Date.now();
        lastActivityRef.current = now;
        throttleTimerRef.current = now;
        try {
            localStorage.setItem(STORAGE_KEY, String(now));
        } catch {
            // ignore
        }
        setShowWarning(false);
        setSecondsRemaining(Math.round(WARNING_DURATION_MS / 1000));
        toast.success("Session extended. You are still signed in.");
    };

    // Cross-tab synchronization & Activity check interval
    useEffect(() => {
        if (!session?.user) {
            setShowWarning(false);
            return;
        }

        // Initialize timestamp
        const now = Date.now();
        lastActivityRef.current = now;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const storedTime = Number(stored);
                if (!isNaN(storedTime) && now - storedTime < IDLE_TIMEOUT_MS) {
                    lastActivityRef.current = storedTime;
                } else {
                    localStorage.setItem(STORAGE_KEY, String(now));
                }
            } else {
                localStorage.setItem(STORAGE_KEY, String(now));
            }
        } catch {
            // ignore
        }

        // Listen to cross-tab storage changes
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "jenga365_logout_broadcast" && !isLoggingOutRef.current) {
                isLoggingOutRef.current = true;
                window.location.href = `/login?reason=idle_timeout`;
                return;
            }

            if (e.key === STORAGE_KEY && e.newValue) {
                const updatedTime = Number(e.newValue);
                if (!isNaN(updatedTime)) {
                    lastActivityRef.current = updatedTime;
                    if (Date.now() - updatedTime < IDLE_TIMEOUT_MS - WARNING_DURATION_MS) {
                        setShowWarning(false);
                    }
                }
            }
        };
        window.addEventListener("storage", handleStorageChange);

        // Activity event listeners with mouse threshold to prevent trackpad drift resets
        const handleMouseMove = (e: MouseEvent) => {
            if (!lastMousePosRef.current) {
                lastMousePosRef.current = { x: e.clientX, y: e.clientY };
                return;
            }
            const dx = e.clientX - lastMousePosRef.current.x;
            const dy = e.clientY - lastMousePosRef.current.y;
            if (dx * dx + dy * dy > 225) { // At least 15px distance
                lastMousePosRef.current = { x: e.clientX, y: e.clientY };
                recordActivity();
            }
        };

        const discreteEvents: (keyof WindowEventMap)[] = [
            "mousedown",
            "keydown",
            "scroll",
            "touchstart",
            "click",
        ];

        const handleDiscreteActivity = () => {
            recordActivity();
        };

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        discreteEvents.forEach((eventName) => {
            window.addEventListener(eventName, handleDiscreteActivity, { passive: true });
        });

        // When returning to tab (laptop wake, tab switch, mobile return)
        const handleVisibilityOrFocus = () => {
            if (document.visibilityState === "visible") {
                let latestActive = lastActivityRef.current;
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        const storedTime = Number(stored);
                        if (!isNaN(storedTime)) {
                            latestActive = Math.max(latestActive, storedTime);
                            lastActivityRef.current = latestActive;
                        }
                    }
                } catch {
                    // ignore
                }

                const elapsed = Date.now() - latestActive;
                if (elapsed >= IDLE_TIMEOUT_MS) {
                    handleIdleLogout();
                } else if (elapsed >= IDLE_TIMEOUT_MS - WARNING_DURATION_MS) {
                    setShowWarning(true);
                    setSecondsRemaining(Math.max(1, Math.round((IDLE_TIMEOUT_MS - elapsed) / 1000)));
                } else {
                    setShowWarning(false);
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityOrFocus);
        window.addEventListener("focus", handleVisibilityOrFocus);

        // Heartbeat interval to check inactivity
        const intervalId = setInterval(() => {
            let latestActive = lastActivityRef.current;
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const storedTime = Number(stored);
                    if (!isNaN(storedTime)) {
                        latestActive = Math.max(latestActive, storedTime);
                        lastActivityRef.current = latestActive;
                    }
                }
            } catch {
                // ignore
            }

            const elapsed = Date.now() - latestActive;
            const remaining = IDLE_TIMEOUT_MS - elapsed;

            if (remaining <= 0) {
                clearInterval(intervalId);
                handleIdleLogout();
            } else if (remaining <= WARNING_DURATION_MS) {
                setShowWarning(true);
                setSecondsRemaining(Math.max(1, Math.round(remaining / 1000)));
            } else {
                if (showWarningRef.current) {
                    setShowWarning(false);
                }
            }
        }, 1000);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("mousemove", handleMouseMove);
            discreteEvents.forEach((eventName) => {
                window.removeEventListener(eventName, handleDiscreteActivity);
            });
            document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
            window.removeEventListener("focus", handleVisibilityOrFocus);
        };
    }, [session?.user, recordActivity, handleIdleLogout]);

    if (!session?.user || !showWarning) {
        return null;
    }

    return (
        <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="session-warning-title"
            aria-describedby="session-warning-desc"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
            <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Clock className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                        <h2 id="session-warning-title" className="text-headline text-foreground font-semibold flex items-center gap-2">
                            Session Inactivity Warning
                        </h2>
                        <p id="session-warning-desc" className="text-body-sm text-foreground-muted">
                            For security purposes, your session will expire due to inactivity.
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-center space-y-1.5">
                    <p className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
                        Auto log out in
                    </p>
                    <div className="text-3xl font-mono font-bold text-foreground">
                        00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
                    </div>
                    <p className="text-xs text-foreground-muted">
                        Move your mouse, press any key, or click below to stay signed in.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleStayLoggedIn}
                        className="inline-flex h-10 w-full sm:flex-1 items-center justify-center gap-2 rounded-md text-label font-medium text-white transition-opacity hover:opacity-90 cursor-pointer shadow-sm"
                        style={{ background: "var(--brand-green)" }}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Stay Signed In
                    </button>
                    <button
                        type="button"
                        onClick={handleIdleLogout}
                        className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-border bg-background px-4 text-label font-medium text-foreground hover:bg-[color:var(--surface-2)] transition-colors cursor-pointer"
                    >
                        <LogOut className="h-4 w-4 text-foreground-muted" />
                        Log Out Now
                    </button>
                </div>
            </div>
        </div>
    );
}
