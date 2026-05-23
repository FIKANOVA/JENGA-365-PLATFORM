"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { and, ne, or, sql, isNull, inArray } from "drizzle-orm";
import { headers } from "next/headers";

export interface UserSearchResult {
    id: string;
    name: string;
    email: string;
    role: string;
    image: string | null;
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
