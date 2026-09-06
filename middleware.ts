import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    capabilityForRoute,
    hasCapability,
    normalizeRole,
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
    user?: CookieUser;
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
    const host = request.headers.get("host") || "";
    if (host.startsWith("www.jenga365.org")) {
        const url = request.nextUrl.clone();
        url.host = "jenga365.org";
        url.protocol = "https";
        return NextResponse.redirect(url, { status: 301 });
    }

    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/assets") ||
        pathname.startsWith("/google") ||
        pathname.endsWith(".html") ||
        pathname.endsWith(".txt") ||
        pathname.endsWith(".xml") ||
        pathname.endsWith(".webmanifest") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".jpg") ||
        pathname.endsWith(".svg") ||
        pathname.endsWith(".ico") ||
        pathname === "/favicon.ico" ||
        pathname === "/robots.txt" ||
        pathname === "/sitemap.xml" ||
        pathname === "/site.webmanifest"
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

    const hasValidToken = Boolean(sessionToken?.value && sessionToken.value.trim() !== "");
    let isAuthenticated = false;
    let sessionUser: CookieUser | null = null;

    if (hasValidToken) {
        isAuthenticated = true;
        if (sessionDataCookie?.value) {
            const data = parseSessionDataCookie(sessionDataCookie.value);
            if (data) {
                const expired = data.expiresAt ? data.expiresAt < Date.now() : false;
                if (expired) {
                    isAuthenticated = false;
                    sessionUser = null;
                } else {
                    sessionUser = data.user ?? data.session?.user ?? null;
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
        const searchParams = request.nextUrl.searchParams;
        const isExplicitAuthIntent =
            searchParams.has("reason") ||
            searchParams.has("logout") ||
            searchParams.has("signedOut") ||
            searchParams.has("error") ||
            searchParams.has("deleted") ||
            searchParams.get("reason") === "idle_timeout";

        if (!isExplicitAuthIntent) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // When user explicitly visits login with logout/idle intent, clear any lingering stale cookies
        const response = NextResponse.next();
        response.cookies.delete("__Secure-better-auth.session_token");
        response.cookies.delete("better-auth.session_token");
        response.cookies.delete("__Secure-better-auth.session_data");
        response.cookies.delete("better-auth.session_data");
        return response;
    }

    if (sessionUser) {
        const role = normalizeRole(sessionUser.role);
        const { moderationScope, ndaSigned, intakeCompleted } = sessionUser;
        const isOrgPartner = role === "CorporatePartner" || role === "NGO";

        // Org partners (corporate + NGO) sign an NDA at registration — gate until signed.
        if (isOrgPartner && !ndaSigned) {
            if (!pathname.startsWith("/legal/nda") && !matchesPrefix(pathname, ONBOARDING_ROUTES)) {
                const url = new URL("/legal/nda", request.url);
                url.searchParams.set("next", pathname);
                return NextResponse.redirect(url);
            }
        }

        // Strict Role-Based Dashboard Access Control
        if (pathname.startsWith("/dashboard/admin") && role !== "SuperAdmin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        if (pathname.startsWith("/dashboard/moderator") && role !== "Moderator" && role !== "SuperAdmin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        if (pathname.startsWith("/dashboard/mentor") && role !== "Mentor" && role !== "SuperAdmin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        if (pathname.startsWith("/dashboard/partner") && role !== "CorporatePartner" && role !== "SuperAdmin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        if (pathname.startsWith("/dashboard/ngo") && role !== "NGO" && role !== "SuperAdmin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        if (pathname.startsWith("/dashboard/mentee") && role !== "Mentee" && role !== "SuperAdmin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
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
    matcher: ["/((?!api|_next/static|_next/image|assets|google.*|favicon.ico|robots.txt|sitemap.xml|site.webmanifest|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|webmanifest)$).*)"],
};
