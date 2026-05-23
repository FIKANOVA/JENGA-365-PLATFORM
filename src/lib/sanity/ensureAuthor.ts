import "server-only";
import { sanityWriteClient } from "./writeClient";

// Deterministic ID keeps the author doc 1:1 with the Jenga user.
export function authorDocIdFor(jengaUserId: string): string {
    return `author-jenga-${jengaUserId}`;
}

interface EnsureAuthorArgs {
    userId: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    bio?: string | null;
    role?: string | null;
}

// Idempotent. createIfNotExists handles the first-time case; a subsequent patch
// keeps the mutable fields (name/bio/role) in sync if the Jenga profile changes.
export async function ensureAuthorDoc(args: EnsureAuthorArgs): Promise<void> {
    const _id = authorDocIdFor(args.userId);
    const name = args.name ?? args.email ?? "Anonymous";
    const bio = args.bio ?? null;
    const role = args.role ?? null;

    await sanityWriteClient.createIfNotExists({
        _id,
        _type: "author",
        name,
        userId: args.userId,
        ...(bio ? { bio } : {}),
        ...(role ? { role } : {}),
    });

    // Re-sync mutable fields. Sanity's patch.set is a no-op when values match,
    // so this is safe to call on every Studio open / first publish.
    const patch = sanityWriteClient.patch(_id).set({ name });
    if (bio) patch.set({ bio });
    if (role) patch.set({ role });
    await patch.commit({ visibility: "async" }).catch(() => {
        // Patch may race with createIfNotExists on first run; ignore.
    });
}
