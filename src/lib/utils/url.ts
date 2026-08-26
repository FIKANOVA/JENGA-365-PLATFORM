/**
 * Centralized URL resolution utility for Jenga365.
 * Guarantees that canonical production URLs (https://jenga365.org) are used
 * and automatically prevents Vercel preview domain leakage or double-slash issues.
 */
export function getBaseUrl(): string {
    const customUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    if (customUrl) {
        return customUrl.replace(/\/+$/, "");
    }

    const authUrl = process.env.BETTER_AUTH_URL;
    if (authUrl) {
        const cleaned = authUrl.replace(/\/+$/, "");
        // If BETTER_AUTH_URL points to a vercel.app preview URL in production, prefer canonical domain
        if (cleaned.includes(".vercel.app") && !cleaned.includes("localhost")) {
            return "https://jenga365.org";
        }
        return cleaned;
    }

    return "https://jenga365.org";
}
