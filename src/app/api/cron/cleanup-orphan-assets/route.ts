import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sanityWriteClient } from "@/lib/sanity/writeClient";

// Finds Sanity image assets that no article (draft OR published) references in
// either its mainImage or its body[].asset._ref, then deletes them. Idempotent.
// Scoped to `*-jenga-*` Neon-authored articles via a generous OR — Studio
// articles are checked the same way.
const ORPHAN_QUERY = `
*[_type == "sanity.imageAsset"
  && !(_id in *[_type == "article"].mainImage.asset._ref)
  && !(_id in *[_type == "article"].body[_type == "image"].asset._ref)
  && !(_id in *[_type == "article"].author->image.asset._ref)
  && !(_id in *[_type == "siteSettings"].landingHeroImage.asset._ref)
  && !(_id in *[_type == "siteSettings"].aboutHeroImage.asset._ref)
  && !(_id in *[_type == "product"].mainImage.asset._ref)
  && !(_id in *[_type == "event"].mainImage.asset._ref)
  && !(_id in *[_type == "teamOfficial"].headshot.asset._ref)
  && dateTime(_createdAt) < dateTime(now()) - 60*60*24
]._id
`;

export async function GET(request: NextRequest) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let orphanIds: string[] = [];
    try {
        orphanIds = await sanityWriteClient.fetch<string[]>(ORPHAN_QUERY);
    } catch (err) {
        console.error("[cleanup-orphan-assets] fetch failed", err);
        return NextResponse.json(
            { error: "Sanity fetch failed", detail: String(err) },
            { status: 500 },
        );
    }

    if (orphanIds.length === 0) {
        return NextResponse.json({ ok: true, deleted: 0 });
    }

    // Batch deletes in transactions of 50 to avoid request-size limits.
    const BATCH = 50;
    let deleted = 0;
    const errors: Array<{ batch: number; error: string }> = [];

    for (let i = 0; i < orphanIds.length; i += BATCH) {
        const batch = orphanIds.slice(i, i + BATCH);
        try {
            let tx = sanityWriteClient.transaction();
            for (const id of batch) tx = tx.delete(id);
            await tx.commit({ visibility: "async" });
            deleted += batch.length;
        } catch (err) {
            errors.push({ batch: i / BATCH, error: String(err) });
            console.error("[cleanup-orphan-assets] batch failed", { batch: i / BATCH, err });
        }
    }

    return NextResponse.json({
        ok: errors.length === 0,
        deleted,
        failedBatches: errors.length,
        total: orphanIds.length,
    });
}
