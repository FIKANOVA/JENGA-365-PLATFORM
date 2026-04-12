/**
 * Pure middleware utility functions — kept separate from middleware.ts so they
 * can be unit-tested in Vitest without Edge Runtime constraints.
 */

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
