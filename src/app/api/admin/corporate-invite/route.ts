import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireCapability } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { inviteLinks } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";

async function signHS256(payload: Record<string, unknown>, secret: string): Promise<string> {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
        .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const body = btoa(JSON.stringify(payload))
        .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const data = `${header}.${body}`;
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
        .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    return `${data}.${sigB64}`;
}

export async function POST(request: NextRequest) {
    try {
        await requireCapability("GENERATE_CORPORATE_INVITE_JWT");
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "FORBIDDEN";
        return NextResponse.json({ error: msg }, { status: msg === "UNAUTHORIZED" ? 401 : 403 });
    }

    const secret = process.env.INVITE_JWT_SECRET;
    if (!secret) {
        return NextResponse.json({ error: "INVITE_JWT_SECRET not configured" }, { status: 500 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const body = await request.json().catch(() => ({}));
    const { email } = body as { email?: string };

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 24 * 7; // 7 days
    const jti = crypto.randomUUID();

    const token = await signHS256(
        { sub: email ?? "", role: "CorporatePartner", iat: now, exp, jti },
        secret
    );

    const expiresAt = new Date(exp * 1000);

    await db.insert(inviteLinks).values({
        inviterId: session!.user.id,
        token,
        roleAssigned: "CorporatePartner",
        inviteeEmail: email ?? null,
        expiresAt,
    });

    return NextResponse.json({ token, expiresAt });
}
