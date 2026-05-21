import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireCapability } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { projectLocations, treeSurvivalAudits, treeSurvivalChecks } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";

const SpatialPayloadSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    latitude: z.number(),
    longitude: z.number(),
    projectType: z.enum(["clinic", "webinar", "tree_planting", "mentorship_hub", "corporate_funded", "workshop"]),
    startDate: z.string(),
    checkId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
    try {
        await requireCapability("INTAKE_SPATIAL_DATA");
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "FORBIDDEN";
        return NextResponse.json({ error: msg }, { status: msg === "UNAUTHORIZED" ? 401 : 403 });
    }

    const session = await auth.api.getSession({ headers: await headers() });
    const body = await request.json().catch(() => null);
    const parsed = SpatialPayloadSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 422 });
    }

    const { name, description, latitude, longitude, projectType, startDate, checkId } = parsed.data;

    const [location] = await db
        .insert(projectLocations)
        .values({
            name,
            description: description ?? null,
            latitude: String(latitude),
            longitude: String(longitude),
            projectType,
            startDate: new Date(startDate),
            createdBy: session!.user.id,
        })
        .returning({ id: projectLocations.id });

    if (checkId) {
        const [check] = await db
            .select({ id: treeSurvivalChecks.id })
            .from(treeSurvivalChecks)
            .where(eq(treeSurvivalChecks.id, checkId))
            .limit(1);

        if (check) {
            await db.insert(treeSurvivalAudits).values({
                checkId: check.id,
                action: "verified",
                actorId: session!.user.id,
                actorRole: "Moderator",
                notes: `Spatial data ingested for location ${location.id}`,
            });
        }
    }

    return NextResponse.json({ ok: true, locationId: location.id });
}
