import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    capabilityForRoute,
    hasCapability,
    parseScopes,
    type ModeratorScope,
    type Role,
} from "@/lib/auth/roles";

const PUBLIC_ROUTES = [
    "/", "/about", "/articles", "/events", "/resources",
    "/contact", "/shop", "/donate", "/help", "/impact", "/voices",
    "/privacy", "/terms", "/legal", "/mentors", "/mentees",
];

const AUTH_ONLY_ROUTES = ["/login", "/register"];
const ONBOARDING_ROUTES = [
    "/legal/nda", "/onboarding", "/verify-email",
    "/pending-approval", "/pending", "/moderator-invite", "/admin-setup",
    "/email-test", "/forgot-password", "/reset-password", "/two-factor",
];

interface CookieUser {
    role?: Role;
    moderationScope?: string;
    ndaSigned?: boolean;
    intakeCompleted?: boolean;
}

interface SessionData {
    session?: {
        user?: CookieUser;
    };
    expiresAt?: number;
}

function parseSessionDataCookie(value: string): SessionData | null {
    try {
        const payload = value.split(".")[0];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded) as SessionData;
    } catch {
        return null;
    }
}

function matchesPrefix(pathname: string, routes: string[]): boolean {
    return routes.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/assets") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    // Better Auth prefixes cookie names with __Secure- on HTTPS (production).
    const sessionToken =
        request.cookies.get("__Secure-better-auth.session_token") ??
        request.cookies.get("better-auth.session_token");
    const sessionDataCookie =
        request.cookies.get("__Secure-better-auth.session_data") ??
        request.cookies.get("better-auth.session_data");

    let isAuthenticated = false;
    let sessionUser: CookieUser | null = null;

    if (sessionToken) {
        // Session token present = authenticated. The actual token expiry is
        // enforced server-side by Better Auth on every API call.
        isAuthenticated = true;
        if (sessionDataCookie) {
            const data = parseSessionDataCookie(sessionDataCookie.value);
            if (data) {
                const expired = data.expiresAt ? data.expiresAt < Date.now() : false;
                if (!expired) {
                    sessionUser = data.session?.user ?? null;
                }
            }
        }
    }

    // ── GUEST ─────────────────────────────────────────────────────────────────
    if (!isAuthenticated) {
        if (
            matchesPrefix(pathname, PUBLIC_ROUTES) ||
            matchesPrefix(pathname, AUTH_ONLY_ROUTES) ||
            matchesPrefix(pathname, ONBOARDING_ROUTES)
        ) {
            return NextResponse.next();
        }
        const url = new URL("/login", request.url);
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    // ── AUTHENTICATED ─────────────────────────────────────────────────────────
    if (matchesPrefix(pathname, AUTH_ONLY_ROUTES)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (sessionUser) {
        const { role, moderationScope, ndaSigned, intakeCompleted } = sessionUser;
        const isOrgPartner = role === "CorporatePartner" || role === "NGO";

        // Org partners (corporate + NGO) sign an NDA at registration — gate until signed.
        if (isOrgPartner && !ndaSigned) {
            if (!pathname.startsWith("/legal/nda") && !matchesPrefix(pathname, ONBOARDING_ROUTES)) {
                const url = new URL("/legal/nda", request.url);
                url.searchParams.set("next", pathname);
                return NextResponse.redirect(url);
            }
        }

        // Keep the two partner portals separated.
        if (role === "NGO" && pathname.startsWith("/dashboard/partner")) {
            return NextResponse.redirect(new URL("/dashboard/ngo", request.url));
        }
        if (role === "CorporatePartner" && pathname.startsWith("/dashboard/ngo")) {
            return NextResponse.redirect(new URL("/dashboard/partner", request.url));
        }

        // Mentee: intake gate on dashboard routes
        if (role === "Mentee" && !intakeCompleted && pathname.startsWith("/dashboard")) {
            if (!pathname.startsWith("/onboarding/intake")) {
                const url = new URL("/onboarding/intake", request.url);
                url.searchParams.set("next", pathname);
                return NextResponse.redirect(url);
            }
        }

        // Capability-gated routes
        const cap = capabilityForRoute(pathname);
        if (cap) {
            const scopes: ModeratorScope[] = parseScopes(moderationScope);
            if (!hasCapability(role ?? "Mentee", scopes, cap)) {
                const url = new URL("/dashboard", request.url);
                url.searchParams.set("denied", cap);
                return NextResponse.redirect(url);
            }
        }
    }

    // Expose the current path to Server Components (the dashboard layout uses this to
    // redirect users who land on a dashboard that isn't theirs). Without this header the
    // role-separation redirect in src/app/dashboard/layout.tsx is a no-op.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico).*)"],
};
