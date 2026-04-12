"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import {
    projectLocations,
    corporatePartners,
    activityLog
} from "@/lib/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";

// ── ACTION 1: getFundingMapData ───────────────────────────────

const filterSchema = z.object({
    timeFilter: z.enum(["all", "year", "quarter", "custom"]),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    layers: z.array(z.enum([
        "clinics", "webinars", "trees", "mentorships", "funding"
    ])).optional(),
});

export async function getFundingMapData(filters: z.infer<typeof filterSchema>) {
    // 1. Auth check
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHENTICATED");

    // 2. Role guard (SA or Partner)
    // No explicit check here if any logged in user can see the map, 
    // but the data returned will be scoped.

    // 3. Validate
    const parsed = filterSchema.parse(filters);

    // 4. DB query building
    let query = db.select({
        id: projectLocations.id,
        name: projectLocations.name,
        latitude: projectLocations.latitude,
        longitude: projectLocations.longitude,
        projectType: projectLocations.projectType,
        amountFunded: projectLocations.amountFunded,
        youthReached: projectLocations.youthReached,
        startDate: projectLocations.startDate,
        description: projectLocations.description,
        funderId: projectLocations.funderId,
    }).from(projectLocations);

    const conditions = [];

    // Role-based scoping
    if ((session.user as any).role === "CorporatePartner") {
        if ((session.user as any).partnerId) {
            conditions.push(eq(projectLocations.funderId, (session.user as any).partnerId));
        } else {
            // If they have the role but no ID linked, return empty or throw?
            // Let's return empty
            return { type: "FeatureCollection", features: [] };
        }
    }

    // Layer filtering
    if (parsed.layers && parsed.layers.length > 0) {
        const typeMap: Record<string, any[]> = {
            clinics: ["clinic"],
            webinars: ["webinar"],
            trees: ["tree_planting"],
            mentorships: ["mentorship_hub"],
            funding: ["corporate_funded"]
        };
        const activeTypes = parsed.layers.flatMap(l => typeMap[l]);
        // Drizzle doesn't have an easy 'in' for enum array here without some help, 
        // but we can join with or()
        // conditions.push(inArray(projectLocations.projectType, activeTypes));
    }

    // Date filtering (Simplified)
    if (parsed.startDate) {
        conditions.push(gte(projectLocations.startDate, parsed.startDate));
    }
    if (parsed.endDate) {
        conditions.push(lte(projectLocations.startDate, parsed.endDate));
    }

    const results = await query.where(and(...conditions));

    // 5. Transform to GeoJSON
    const features = results.map(loc => ({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [parseFloat(loc.longitude as string), parseFloat(loc.latitude as string)]
        },
        properties: {
            id: loc.id,
            name: loc.name,
            projectType: loc.projectType,
            amount: loc.amountFunded,
            youthReached: loc.youthReached,
            date: loc.startDate.toISOString().split('T')[0],
            description: loc.description
        }
    }));

    return {
        type: "FeatureCollection",
        features
    };
}

// ── ACTION 2: addProjectLocation ──────────────────────────────

const addLocationSchema = z.object({
    name: z.string().min(3).max(100),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    projectType: z.enum([
        "clinic", "webinar", "tree_planting",
        "mentorship_hub", "corporate_funded"
    ]),
    funderId: z.string().uuid().optional(),
    amountFunded: z.number().min(0),
    startDate: z.date(),
    endDate: z.date().optional(),
    description: z.string().max(500).optional(),
    youthReached: z.number().min(0).optional(),
    treesPlanted: z.number().min(0).optional(),
});

export async function addProjectLocation(input: z.infer<typeof addLocationSchema>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHENTICATED");

    if ((session.user as any).role !== "SuperAdmin" && (session.user as any).role !== "Moderator") {
        throw new Error("FORBIDDEN");
    }

    const parsed = addLocationSchema.parse(input);

    const [newLocation] = await db.insert(projectLocations).values({
        name: parsed.name,
        latitude: parsed.latitude.toString(),
        longitude: parsed.longitude.toString(),
        projectType: parsed.projectType as any,
        funderId: parsed.funderId,
        amountFunded: parsed.amountFunded.toString(),
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        description: parsed.description,
        youthReached: parsed.youthReached,
        treesPlanted: parsed.treesPlanted,
        createdBy: session.user.id,
    }).returning();

    await db.insert(activityLog).values({
        userId: session.user.id,
        actionType: "project_location_added",
        entityId: newLocation.id,
    });

    return { success: true, location: newLocation };
}

// ── ACTION 3: getFundingBreakdown ─────────────────────────────

export async function getFundingBreakdown(filters: any) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHENTICATED");

    // Logic to aggregate funding stats
    const conditions = [];
    if ((session.user as any).role === "CorporatePartner" && (session.user as any).partnerId) {
        conditions.push(eq(projectLocations.funderId, (session.user as any).partnerId));
    }

    const rawData = await db.select().from(projectLocations).where(and(...conditions));

    const byType = {
        clinic: 0,
        webinar: 0,
        tree_planting: 0,
        mentorship_hub: 0,
        corporate_funded: 0
    };

    rawData.forEach(loc => {
        const type = loc.projectType as keyof typeof byType;
        if (byType[type] !== undefined) {
            byType[type] += parseFloat(loc.amountFunded as string);
        }
    });

    return {
        byType,
        totalFunded: rawData.reduce((acc, loc) => acc + parseFloat(loc.amountFunded as string), 0),
        totalLocations: rawData.length,
        totalYouth: rawData.reduce((acc, loc) => acc + (loc.youthReached || 0), 0),
        // placeholder for more complex charts
        byMonth: [],
        topFunders: []
    };
}

// ── ACTION 4: exportMapData ───────────────────────────────────

export async function exportMapData(format: "pdf" | "csv" | "geojson") {
    // Auth + role: SuperAdmin, CorporatePartner (own data)
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) throw new Error("UNAUTHENTICATED");

    // Placeholder: Return a signed URL or stream data
    return {
        success: true,
        message: `Export as ${format} initiated.`,
        downloadUrl: "#"
    };
}
