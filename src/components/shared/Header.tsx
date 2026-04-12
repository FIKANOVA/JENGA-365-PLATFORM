"use client";

import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import PublicHeader from "@/components/marketing/PublicHeader";
import AuthenticatedHeader from "@/components/dashboard/AuthenticatedHeader";
import MinimalHeader from "@/components/shared/MinimalHeader";

// ── Jenga365 Header State Machine ──────────────────────────────────────────
// Per SCREEN_FLOW_V2.md: Header is determined by AUTHENTICATION STATE, not route.
//
// | User State       | Public Pages        | Dashboard Pages     | Auth Pages          |
// |------------------|---------------------|---------------------|---------------------|
// | GUEST            | PublicHeader         | N/A (redirect)      | MinimalHeader       |
// | AUTHENTICATED    | AuthenticatedHeader  | AuthenticatedHeader | N/A (redirect)      |
// ────────────────────────────────────────────────────────────────────────────

interface HeaderProps {
    readonly minimalProps?: {
        readonly currentStep?: number;
        readonly totalSteps?: number;
    };
}

// Routes that use MinimalHeader for guests
function isAuthRoute(pathname: string): boolean {
    return (
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/verify-email") ||
        pathname.startsWith("/admin-setup") ||
        pathname.startsWith("/moderator-invite")
    );
}

// Routes that use Legal/Waiting header variants
function isLegalRoute(pathname: string): boolean {
    return pathname.startsWith("/legal/nda");
}

function isPendingRoute(pathname: string): boolean {
    return pathname.startsWith("/pending-approval") || pathname.startsWith("/pending");
}

export default function Header({ minimalProps }: HeaderProps) {
    const pathname = usePathname();
    const { data: session, isPending } = useSession();
    const isAuthenticated = !!session?.user;
    const userRole = (session?.user as Record<string, unknown>)?.role as string | undefined;
    const userName = session?.user?.name ?? "";

    // ── LOADING STATE ──────────────────────────────────────────────────────
    // While session is loading, show a minimal header to prevent flash
    if (isPending) {
        return (
            <header className="sticky top-0 z-50 bg-background border-b border-border h-16 flex items-center px-6">
                <div className="h-10 w-32 bg-accent animate-pulse rounded" />
            </header>
        );
    }

    // ── AUTHENTICATED USER — Always sees AuthenticatedHeader ───────────────
    // Per SCREEN_FLOW_V2: "Header is Determined by Authentication State, Not Route"
    if (isAuthenticated) {
        // Special case: Legal/NDA page during registration flow
        if (isLegalRoute(pathname)) {
            return (
                <MinimalHeader
                    currentStep={minimalProps?.currentStep ?? 3}
                    totalSteps={minimalProps?.totalSteps ?? 4}
                />
            );
        }

        // Special case: Pending approval page
        if (isPendingRoute(pathname)) {
            return (
                <MinimalHeader
                    currentStep={minimalProps?.currentStep ?? 3}
                    totalSteps={minimalProps?.totalSteps ?? 4}
                />
            );
        }

        // All other pages (public + dashboard): Authenticated Header
        const isOnboarded = (session?.user as any)?.onboarded ?? false;

        return (
            <AuthenticatedHeader
                userRole={userRole}
                userName={userName}
                isOnboarded={isOnboarded}
            />
        );
    }

    // ── GUEST USER ─────────────────────────────────────────────────────────

    // Auth routes (login, register, verify-email) → Minimal Header
    if (isAuthRoute(pathname)) {
        return (
            <MinimalHeader
                currentStep={minimalProps?.currentStep ?? 1}
                totalSteps={minimalProps?.totalSteps ?? 3}
            />
        );
    }

    // Legal/NDA route (during registration) → Minimal Header with progress
    if (isLegalRoute(pathname)) {
        return (
            <MinimalHeader
                currentStep={minimalProps?.currentStep ?? 3}
                totalSteps={minimalProps?.totalSteps ?? 4}
            />
        );
    }

    // Pending approval → Minimal Header
    if (isPendingRoute(pathname)) {
        return (
            <MinimalHeader
                currentStep={minimalProps?.currentStep ?? 3}
                totalSteps={minimalProps?.totalSteps ?? 4}
            />
        );
    }

    // Default: Public Header (all marketing/public pages)
    return <PublicHeader />;
}
