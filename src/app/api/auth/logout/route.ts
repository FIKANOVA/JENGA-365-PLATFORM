import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export async function POST(req: NextRequest) {
    try {
        await auth.api.signOut({
            headers: req.headers,
        }).catch(() => {});
    } catch {
        // Continue even if session is already expired or missing
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });

    const cookieNames = [
        "better-auth.session_token",
        "__Secure-better-auth.session_token",
        "better-auth.session_data",
        "__Secure-better-auth.session_data",
        "better-auth.dont_remember",
        "better-auth.account_data",
        "__Secure-better-auth.account_data",
    ];

    for (const name of cookieNames) {
        response.cookies.set(name, "", {
            path: "/",
            maxAge: 0,
            expires: new Date(0),
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
    }

    return response;
}

export async function GET(req: NextRequest) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || "/login";
    const reason = req.nextUrl.searchParams.get("reason") || "logout";

    const targetUrl = new URL("/login", req.url);
    targetUrl.searchParams.set("reason", reason);
    if (callbackUrl && callbackUrl !== "/login") {
        targetUrl.searchParams.set("callbackUrl", callbackUrl);
    }

    const response = NextResponse.redirect(targetUrl);

    const cookieNames = [
        "better-auth.session_token",
        "__Secure-better-auth.session_token",
        "better-auth.session_data",
        "__Secure-better-auth.session_data",
        "better-auth.dont_remember",
        "better-auth.account_data",
        "__Secure-better-auth.account_data",
    ];

    for (const name of cookieNames) {
        response.cookies.set(name, "", {
            path: "/",
            maxAge: 0,
            expires: new Date(0),
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
    }

    return response;
}
