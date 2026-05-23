"use server";

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { ensureAuthorDoc } from "@/lib/sanity/ensureAuthor";

const MAX_BIO_LENGTH = 600;
const MAX_TITLE_LENGTH = 120;

export interface AuthorProfileInput {
    bio: string;
    professionalTitle: string;
}

async function requireUser() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("UNAUTHORIZED");
    return session.user;
}

export async function getAuthorProfile() {
    const user = await requireUser();
    const row = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { metadata: true },
    });
    const meta = (row?.metadata as { bio?: string; professionalTitle?: string } | null) ?? null;
    return {
        bio: meta?.bio ?? "",
        professionalTitle: meta?.professionalTitle ?? "",
    };
}

export async function updateAuthorProfile(input: AuthorProfileInput) {
    const user = await requireUser();
    const bio = input.bio.trim().slice(0, MAX_BIO_LENGTH);
    const professionalTitle = input.professionalTitle.trim().slice(0, MAX_TITLE_LENGTH);

    const row = await db.query.users.findFirst({
        where: eq(users.id, user.id),
        columns: { metadata: true, name: true, email: true },
    });
    const existingMeta = (row?.metadata as Record<string, unknown> | null) ?? {};
    const nextMeta = {
        ...existingMeta,
        bio: bio || undefined,
        professionalTitle: professionalTitle || undefined,
    };

    await db.update(users)
        .set({ metadata: nextMeta })
        .where(eq(users.id, user.id));

    // Push the updated bio/role into the Sanity author doc immediately so
    // already-published articles reflect the new bio on their public page.
    await ensureAuthorDoc({
        userId: user.id,
        name: row?.name,
        email: row?.email,
        bio: bio || null,
        role: professionalTitle || null,
    }).catch((err) => {
        console.error("[updateAuthorProfile] ensureAuthorDoc failed", err);
    });

    revalidatePath("/dashboard/settings/author-profile");
    return { ok: true };
}
