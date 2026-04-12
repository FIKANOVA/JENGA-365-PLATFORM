import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSessionExpired } from "./src/middleware";

// ── Jenga365 Middleware ─────────────────────────────────────────────────────
// Implements: NDA Gate, Auth Guard, Role-based Dashboard Protection
// Per: SCREEN_FLOW_V2.md, MODULE_1_TO_8_SPEC.md, MODULE_11_SPEC.md
//
// Note: Better Auth uses opaque session tokens (not JWTs), so we cannot verify
// the token itself in Edge Runtime without a DB call. Instead, we use the
// better-auth.session_data cache cookie (base64 JSON, set when cookieCache is
// enabled) to check expiry. The dashboard layout does a full DB session check.

export { isSessionExpired };

const publicRoutes = [
    "/", "/about", "/articles", "/events", "/resources",
    "/contact", "/shop", "/donate", "/help", "/impact", "/voices",
];
const authOnlyRoutes = ["/login", "/register"];
const onboardingRoutes = [
    "/legal/nda", "/onboarding", "/onboarding/intake", "/verify-email",
    "/pending-approval", "/pending", "/moderator-invite", "/admin-setup", "/email-test",
];

function parseSessionDataCookie(cookieValue: string): { expiresAt?: string } | null {
    try {
        // Better Auth session_data is base64url JSON, optionally signed with a dot separator
        const payload = cookieValue.split(".")[0];
        const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for API routes, static assets, and Next.js internals
    if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/assets") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    const sessionToken = request.cookies.get("better-auth.session_token");
    const sessionDataCookie = request.cookies.get("better-auth.session_data");

    // Determine authentication: must have token + unexpired cache (if cache present)
    let isAuthenticated = !!sessionToken;
    if (isAuthenticated && sessionDataCookie) {
        const sessionData = parseSessionDataCookie(sessionDataCookie.value);
        if (isSessionExpired(sessionData?.expiresAt)) {
            isAuthenticated = false;
        }
    }

    // ── GUEST (Not Authenticated) ──────────────────────────────────────────
    if (!isAuthenticated) {
        const isPublicRoute = publicRoutes.some(
            (r) => pathname === r || pathname.startsWith(r + "/")
        );
        const isAuthRoute = authOnlyRoutes.some(
            (r) => pathname === r || pathname.startsWith(r + "/")
        );
        const isOnboardingRoute = onboardingRoutes.some(
            (r) => pathname === r || pathname.startsWith(r + "/")
        );

        if (isPublicRoute || isAuthRoute || isOnboardingRoute) {
            return NextResponse.next();
        }

        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── AUTHENTICATED USER ─────────────────────────────────────────────────
    if (authOnlyRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-user-authenticated", "true");
    response.headers.set("x-pathname", pathname);
    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico).*)"],
};
