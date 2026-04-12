// Re-exported utilities from root middleware for testability in vitest.
// The root middleware.ts imports and re-exports these.
// Next.js requires middleware.ts at the project root — this file provides
// the pure functions that can be unit-tested without Edge Runtime constraints.

/**
 * Checks whether a Better Auth session_data cache cookie has expired.
 * The session_data value is base64url-encoded JSON containing an expiresAt field.
 * Returns true (expired) on any parse error — fail closed for security.
 */
export function isSessionExpired(expiresAt: string | null | undefined): boolean {
    if (!expiresAt) return true;
    try {
        const expiry = new Date(expiresAt).getTime();
        if (isNaN(expiry)) return true;
        return expiry < Date.now();
    } catch {
        return true;
    }
}
