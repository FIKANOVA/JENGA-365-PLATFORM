import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    const secret = process.env.SANITY_WEBHOOK_SECRET;

    if (secret) {
        const signature = req.headers.get("x-sanity-webhook-token") || req.headers.get("authorization");
        if (!signature) {
            return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
        }
        const sigClean = signature.replace(/^Bearer\s+/i, "");
        const sigBuf = Buffer.from(sigClean);
        const secretBuf = Buffer.from(secret);
        if (sigBuf.length !== secretBuf.length || !crypto.timingSafeEqual(sigBuf, secretBuf)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        const body = await req.json().catch(() => ({}));
        const docType = body?._type || body?.type;
        const slug = body?.slug?.current || body?.slug;

        // Revalidate based on updated schema type
        switch (docType) {
            case "article":
                revalidatePath("/resources/articles");
                revalidatePath("/articles");
                revalidatePath("/");
                if (slug) {
                    revalidatePath(`/resources/articles/${slug}`);
                    revalidatePath(`/articles/${slug}`);
                }
                break;

            case "event":
                revalidatePath("/events");
                revalidatePath("/");
                if (body?._id) {
                    revalidatePath(`/events/${body._id}`);
                }
                break;

            case "resource":
                revalidatePath("/resources");
                revalidatePath("/resources/downloads");
                break;

            case "teamOfficial":
                revalidatePath("/about");
                break;

            case "voices":
                revalidatePath("/voices");
                revalidatePath("/about");
                break;

            case "legalPage":
                revalidatePath("/privacy");
                revalidatePath("/terms");
                break;

            case "siteSettings":
            default:
                revalidatePath("/");
                revalidatePath("/about");
                revalidatePath("/impact");
                revalidatePath("/contact");
                revalidatePath("/help");
                revalidatePath("/resources");
                break;
        }

        return NextResponse.json({
            revalidated: true,
            docType: docType ?? "unknown",
            now: Date.now(),
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to revalidate";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
