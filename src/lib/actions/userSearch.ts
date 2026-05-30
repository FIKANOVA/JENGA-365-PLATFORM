"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, mentorshipPairs } from "@/lib/db/schema";
import { and, ne, or, sql, isNull, inArray, eq, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import { effectiveScopes, type ModeratorScope, type Role } from "@/lib/auth/roles";

export interface UserSearchResult {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
}

// ─── Shared directory service ────────────────────────────────────────────────
// One query contract that every role-specific "people" view calls. The shape of
// the result (and which columns are populated) is trimmed per requester role so a
// single privacy rule lives in one place rather than being re-implemented per page.

export interface DirectoryEntry {
    id: string;
    name: string;
    image: string | null;
    role: string;
    region: string | null;
    relationship: string | null; // e.g. "Your mentor", "Your mentee"
    email: string | null;        // only populated where the viewer is allowed to see it
    status: string | null;       // pair status or account status, view-dependent
}

export type DirectoryKind = "assigned_mentors" | "assigned_mentees" | "moderation" | "none";

export interface DirectoryView {
    kind: DirectoryKind;
    title: string;
    subtitle: string;
    entries: DirectoryEntry[];
}

const ACTIVE_PAIR = ["active", "pending"] as const;

/**
 * Returns a role-appropriate, privacy-trimmed directory for the current user.
 * - Mentee  → their assigned mentor(s)   (contact visible — it's their pairing)
 * - Mentor  → their assigned mentees
 * - Moderator → users within their scope (moderation view, with email/status)
 * - others  → none (SuperAdmin uses the admin hub directory)
 */
export async function getMyDirectory(): Promise<DirectoryView> {
    const me = await requireUser();
    const role = (me as { role?: string }).role as Role | undefined;
    const orgType = (me as { orgType?: string }).orgType;
    const scopeString = (me as { moderationScope?: string }).moderationScope;

    if (role === "Mentee") {
        const mentor = alias(users, "mentor_user");
        const rows = await db
            .select({
                id: mentor.id,
                name: mentor.name,
                image: mentor.image,
                role: mentor.role,
                region: mentor.locationRegion,
                email: mentor.email,
                status: mentorshipPairs.status,
            })
            .from(mentorshipPairs)
            .innerJoin(mentor, eq(mentor.id, mentorshipPairs.mentorId))
            .where(and(
                eq(mentorshipPairs.menteeId, me.id),
                inArray(mentorshipPairs.status, [...ACTIVE_PAIR]),
            ))
            .orderBy(desc(mentorshipPairs.matchedAt))
            .catch(() => []);
        return {
            kind: "assigned_mentors",
            title: "Your mentor",
            subtitle: rows.length ? "The mentor(s) matched to you." : "No mentor assigned yet — you'll see them here once matched.",
            entries: rows.map((r) => ({
                id: r.id,
                name: r.name ?? r.email,
                image: r.image,
                role: r.role,
                region: r.region ?? null,
                relationship: "Your mentor",
                email: r.email,
                status: r.status,
            })),
        };
    }

    if (role === "Mentor") {
        const mentee = alias(users, "mentee_user");
        const rows = await db
            .select({
                id: mentee.id,
                name: mentee.name,
                image: mentee.image,
                role: mentee.role,
                region: mentee.locationRegion,
                email: mentee.email,
                status: mentorshipPairs.status,
            })
            .from(mentorshipPairs)
            .innerJoin(mentee, eq(mentee.id, mentorshipPairs.menteeId))
            .where(and(
                eq(mentorshipPairs.mentorId, me.id),
                inArray(mentorshipPairs.status, [...ACTIVE_PAIR]),
            ))
            .orderBy(desc(mentorshipPairs.matchedAt))
            .catch(() => []);
        return {
            kind: "assigned_mentees",
            title: "Your mentees",
            subtitle: rows.length ? "The mentees matched to you." : "No mentees assigned yet.",
            entries: rows.map((r) => ({
                id: r.id,
                name: r.name ?? r.email,
                image: r.image,
                role: r.role,
                region: r.region ?? null,
                relationship: "Your mentee",
                email: r.email,
                status: r.status,
            })),
        };
    }

    if (role === "Moderator") {
        const scopes: ModeratorScope[] = effectiveScopes(role, scopeString);
        // Scope → which account roles a moderator may list.
        const allowedRoles = new Set<string>();
        if (scopes.includes("all")) {
            ["Mentee", "Mentor", "CorporatePartner", "NGO", "Moderator"].forEach((r) => allowedRoles.add(r));
        } else {
            if (scopes.includes("mentor_applications")) { allowedRoles.add("Mentor"); allowedRoles.add("Mentee"); }
            if (scopes.includes("corporate")) { allowedRoles.add("CorporatePartner"); allowedRoles.add("NGO"); }
        }
        if (allowedRoles.size === 0) {
            return { kind: "moderation", title: "User directory", subtitle: "No user categories in your scope.", entries: [] };
        }
        const rows = await db
            .select({
                id: users.id,
                name: users.name,
                image: users.image,
                role: users.role,
                region: users.locationRegion,
                email: users.email,
                status: users.status,
            })
            .from(users)
            .where(and(
                isNull(users.deletedAt),
                inArray(users.role, [...allowedRoles] as ("Mentee" | "Mentor" | "CorporatePartner" | "NGO" | "Moderator")[]),
            ))
            .orderBy(desc(users.createdAt))
            .limit(200)
            .catch(() => []);
        return {
            kind: "moderation",
            title: "User directory",
            subtitle: "Users within your moderation scope.",
            entries: rows.map((r) => ({
                id: r.id,
                name: r.name ?? r.email,
                image: r.image,
                role: r.role,
                region: r.region ?? null,
                relationship: null,
                email: r.email,
                status: r.status,
            })),
        };
    }

    void orgType;
    return { kind: "none", title: "Directory", subtitle: "", entries: [] };
}

async function requireUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");
    return session.user;
}

export async function searchUsersForCoAuthor(query: string): Promise<UserSearchResult[]> {
    const me = await requireUser();
    const q = query.trim();
    if (q.length < 2) return [];

    const like = `%${q.toLowerCase()}%`;
    const rows = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            image: users.image,
        })
        .from(users)
        .where(
            and(
                ne(users.id, me.id),
                isNull(users.deletedAt),
                or(
                    sql`lower(${users.name}) like ${like}`,
                    sql`lower(${users.email}) like ${like}`,
                ),
            ),
        )
        .limit(8);

    return rows.map((r) => ({
        id: r.id,
        name: r.name ?? r.email,
        email: r.email,
        role: r.role,
        image: r.image,
    }));
}

export async function hydrateCoAuthors(ids: string[]): Promise<UserSearchResult[]> {
    if (ids.length === 0) return [];
    await requireUser();
    const rows = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            image: users.image,
        })
        .from(users)
        .where(inArray(users.id, ids));
    return rows.map((r) => ({
        id: r.id,
        name: r.name ?? r.email,
        email: r.email,
        role: r.role,
        image: r.image,
    }));
}
