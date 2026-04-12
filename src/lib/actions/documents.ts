"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import {
    platformDocuments,
    documentAccessLogs,
} from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";
import { processAndEmbedDocument } from "../ai/documentProcessor";

// ── ADMIN ACTIONS ─────────────────────────────────────────────

const uploadDocumentSchema = z.object({
    tier: z.enum(["1", "2", "3"]),
    title: z.string().min(3).max(255),
    version: z.string().min(1).max(20),
    filename: z.string().min(1).max(255),
    fileUrl: z.string().url(),
    fileSize: z.number().positive(),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export async function uploadPlatformDocument(input: z.infer<typeof uploadDocumentSchema>) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session || (session.user as any).role !== "SuperAdmin") {
        throw new Error("UNAUTHORIZED");
    }

    const parsed = uploadDocumentSchema.parse(input);

    const [doc] = await db.insert(platformDocuments).values({
        tier: parsed.tier,
        title: parsed.title,
        version: parsed.version,
        filename: parsed.filename,
        fileUrl: parsed.fileUrl,
        fileSize: parsed.fileSize,
        status: parsed.status,
        uploadedBy: session.user.id,
        publishedAt: parsed.status === "published" ? new Date() : null,
    }).returning();

    return { success: true, document: doc };
}

export async function publishDocument(documentId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session || (session.user as any).role !== "SuperAdmin") {
        throw new Error("UNAUTHORIZED");
    }

    const [doc] = await db.update(platformDocuments)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(platformDocuments.id, documentId))
        .returning();

    return { success: true, document: doc };
}

export async function archiveDocument(documentId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session || (session.user as any).role !== "SuperAdmin") {
        throw new Error("UNAUTHORIZED");
    }

    const [doc] = await db.update(platformDocuments)
        .set({ status: "archived" })
        .where(eq(platformDocuments.id, documentId))
        .returning();

    return { success: true, document: doc };
}

export async function indexDocumentToPgVector(documentId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Only SuperAdmin can trigger the expensive AI index operation
    if (!session || (session.user as any).role !== "SuperAdmin") {
        throw new Error("UNAUTHORIZED");
    }

    try {
        const result = await processAndEmbedDocument(documentId);
        return result;
    } catch (e: any) {
        console.error("Index action failed:", e);
        return { success: false, message: e.message || "Unknown error occurred" };
    }
}

export async function listAdminDocuments() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session || (session.user as any).role !== "SuperAdmin") {
        throw new Error("UNAUTHORIZED");
    }

    return await db.select()
        .from(platformDocuments)
        .orderBy(desc(platformDocuments.uploadedAt));
}

export async function getAccessLogs(limit: number = 50) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session || (session.user as any).role !== "SuperAdmin") {
        throw new Error("UNAUTHORIZED");
    }

    return await db.query.documentAccessLogs.findMany({
        with: {
            // we could join user or document details here via relational queries if defined,
            // otherwise frontend might need to do join or manual lookup
        },
        orderBy: [desc(documentAccessLogs.accessedAt)],
        limit,
    });
}

// ── USER ACCESS ACTIONS ───────────────────────────────────────

export async function listPublicDocuments() {
    // Public Tier 1 documents
    return await db.select()
        .from(platformDocuments)
        .where(
            and(
                eq(platformDocuments.tier, "1"),
                eq(platformDocuments.status, "published")
            )
        )
        .orderBy(desc(platformDocuments.publishedAt));
}

export async function listRoleDocuments() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        throw new Error("UNAUTHENTICATED");
    }

    const role = (session.user as any).role;
    let allowedTiers: ("1" | "2" | "3")[] = ["1"];

    if (role === "SuperAdmin") {
        allowedTiers = ["1", "2", "3"];
    } else if (role === "Moderator" || role === "CorporatePartner") {
        allowedTiers = ["1", "2"];
    } else {
        allowedTiers = ["1"]; // Mentor, Mentee
    }

    return await db.select()
        .from(platformDocuments)
        .where(
            and(
                inArray(platformDocuments.tier, allowedTiers),
                eq(platformDocuments.status, "published")
            )
        )
        .orderBy(desc(platformDocuments.publishedAt));
}

export async function logDocumentAccess(documentId: string, action: "view" | "download" | "print_attempt", ipAddress?: string, userAgent?: string) {
    // Optionally identify user
    let userId: string | null = null;
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (session) {
            userId = session.user.id;
        }
    } catch (e) {
        // user not authenticated
    }

    const [log] = await db.insert(documentAccessLogs).values({
        documentId,
        userId,
        action,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        success: true, // simplified
    }).returning();

    return { success: true, log };
}
