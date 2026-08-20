import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireCapability } from "@/lib/auth/guard";
import { runSanitySeed } from "@/lib/sanity/seed-service";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
        await requireCapability("CREATE_MODERATOR_ACCOUNT");
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "FORBIDDEN";
        return NextResponse.json({ error: msg }, { status: msg === "UNAUTHORIZED" ? 401 : 403 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const { token } = body as { token?: string };

        const result = await runSanitySeed(token);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json(
            {
                success: false,
                error: err?.message || "Failed to seed Sanity CMS",
            },
            { status: 400 }
        );
    }
}
