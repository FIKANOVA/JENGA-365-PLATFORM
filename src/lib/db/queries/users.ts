import { db } from "../index";
import { users, ndaSignatures } from "../schema";
import { eq, and, desc } from "drizzle-orm";

export interface PublicProfile {
    id: string;
    name: string | null;
    image: string | null;
    role: string;
    locationRegion?: string | null;
    profession: string;
    bio?: string | null;
    linkedIn?: string | null;
    x?: string | null;
    instagram?: string | null;
    youtube?: string | null;
    tiktok?: string | null;
    website?: string | null;
    orgName?: string | null;
    createdAt: Date;
}

export async function getUserByEmail(email: string) {
    return db.query.users.findFirst({
        where: eq(users.email, email),
    });
}

export async function checkNDASignature(userId: string) {
    const signature = await db.query.ndaSignatures.findFirst({
        where: eq(ndaSignatures.userId, userId),
        orderBy: (t, { desc }) => [desc(t.signedAt)],
    });
    return !!signature;
}

export async function approveUser(userId: string, moderatorId: string) {
    return db.transaction(async (tx) => {
        await tx
            .update(users)
            .set({ isApproved: true })
            .where(eq(users.id, userId));

        // Log could be added here
    });
}

// ── Public Directory Queries ──────────────────────────────────────────────────

export async function getPublicMentors(limit = 24): Promise<PublicProfile[]> {
    try {
        const rawUsers = await db.query.users.findMany({
            where: and(
                eq(users.role, "Mentor"),
                eq(users.isApproved, true)
            ),
            columns: {
                id: true,
                name: true,
                image: true,
                role: true,
                locationRegion: true,
                metadata: true,
                createdAt: true,
            },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
            limit,
        });

        const list = rawUsers.map((u) => {
            const meta = (u.metadata || {}) as Record<string, any>;
            return {
                id: u.id,
                name: u.name || "Jenga365 Mentor",
                image: u.image || null,
                role: "Mentor",
                locationRegion: u.locationRegion || "Kenya",
                profession: meta.profession || meta.professionalTitle || meta.title || "Senior Mentor & Industry Specialist",
                bio: meta.bio || meta.motivation || meta.notes || "Dedicated mentor empowering athletes and young innovators to excel.",
                linkedIn: meta.linkedIn || null,
                x: meta.x || meta.twitter || null,
                instagram: meta.instagram || null,
                youtube: meta.youtube || null,
                tiktok: meta.tiktok || null,
                website: meta.website || null,
                orgName: meta.orgName || meta.company || null,
                createdAt: u.createdAt,
            };
        });

        return list;
    } catch (e) {
        console.error("[getPublicMentors] query error:", e);
        return [];
    }
}

export async function getPublicMentees(limit = 24): Promise<PublicProfile[]> {
    try {
        const rawUsers = await db.query.users.findMany({
            where: and(
                eq(users.role, "Mentee"),
                eq(users.isApproved, true)
            ),
            columns: {
                id: true,
                name: true,
                image: true,
                role: true,
                locationRegion: true,
                metadata: true,
                createdAt: true,
            },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
            limit,
        });

        const list = rawUsers.map((u) => {
            const meta = (u.metadata || {}) as Record<string, any>;
            return {
                id: u.id,
                name: u.name || "Jenga365 Mentee",
                image: u.image || null,
                role: "Mentee",
                locationRegion: u.locationRegion || "Kenya",
                profession: meta.profession || meta.professionalTitle || meta.sport || meta.educationGoal || "Rising Talent & Emerging Leader",
                bio: meta.bio || meta.goals || meta.motivation || "Committed to personal growth, athletic excellence, and career advancement.",
                linkedIn: meta.linkedIn || null,
                x: meta.x || meta.twitter || null,
                instagram: meta.instagram || null,
                youtube: meta.youtube || null,
                tiktok: meta.tiktok || null,
                website: meta.website || null,
                orgName: meta.orgName || meta.club || meta.school || null,
                createdAt: u.createdAt,
            };
        });

        return list;
    } catch (e) {
        console.error("[getPublicMentees] query error:", e);
        return [];
    }
}

export async function getPublicCommunityProfiles(limit = 36): Promise<PublicProfile[]> {
    try {
        const rawUsers = await db.query.users.findMany({
            where: eq(users.isApproved, true),
            columns: {
                id: true,
                name: true,
                image: true,
                role: true,
                locationRegion: true,
                metadata: true,
                createdAt: true,
            },
            orderBy: (t, { desc }) => [desc(t.createdAt)],
            limit,
        });

        const list = rawUsers.map((u) => {
            const meta = (u.metadata || {}) as Record<string, any>;
            return {
                id: u.id,
                name: u.name || "Community Member",
                image: u.image || null,
                role: u.role,
                locationRegion: u.locationRegion || "Kenya",
                profession: meta.profession || meta.professionalTitle || meta.contactTitle || meta.title || u.role,
                bio: meta.bio || meta.motivation || meta.notes || null,
                linkedIn: meta.linkedIn || null,
                x: meta.x || meta.twitter || null,
                instagram: meta.instagram || null,
                youtube: meta.youtube || null,
                tiktok: meta.tiktok || null,
                website: meta.website || null,
                orgName: meta.orgName || meta.company || null,
                createdAt: u.createdAt,
            };
        });

        return list;
    } catch (e) {
        console.error("[getPublicCommunityProfiles] query error:", e);
        return [];
    }
}

export async function getPublicProfileById(id: string): Promise<PublicProfile | null> {
    try {
        const u = await db.query.users.findFirst({
            where: eq(users.id, id),
            columns: {
                id: true,
                name: true,
                image: true,
                role: true,
                locationRegion: true,
                metadata: true,
                createdAt: true,
            },
        });
        if (!u) return null;

        const meta = (u.metadata || {}) as Record<string, any>;
        return {
            id: u.id,
            name: u.name || "Community Member",
            image: u.image || null,
            role: u.role,
            locationRegion: u.locationRegion || "Kenya",
            profession: meta.profession || meta.professionalTitle || meta.sport || meta.contactTitle || meta.title || u.role,
            bio: meta.bio || meta.motivation || meta.goals || meta.notes || null,
            linkedIn: meta.linkedIn || null,
            x: meta.x || meta.twitter || null,
            instagram: meta.instagram || null,
            youtube: meta.youtube || null,
            tiktok: meta.tiktok || null,
            website: meta.website || null,
            orgName: meta.orgName || meta.company || meta.club || meta.school || null,
            createdAt: u.createdAt,
        };
    } catch (e) {
        console.error("[getPublicProfileById] query error:", e);
        return null;
    }
}
