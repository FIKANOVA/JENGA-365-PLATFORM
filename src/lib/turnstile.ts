/**
 * Cloudflare Turnstile Server-side Token Verification Helper
 * 
 * Validates the Turnstile response token with Cloudflare's siteverify API.
 * Uses official dummy test keys as fallbacks during development/testing.
 */

// Cloudflare official test secret key (always passes)
const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export interface TurnstileVerifyResult {
    success: boolean;
    error?: string;
    hostname?: string;
    challengeTs?: string;
    errorCodes?: string[];
}

export async function verifyTurnstileToken(
    token: string,
    remoteIp?: string | null
): Promise<TurnstileVerifyResult> {
    if (!token) {
        return { success: false, error: "Turnstile token is required." };
    }

    const secretKey =
        process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
        (process.env.NODE_ENV === "production" ? "" : TEST_SECRET_KEY);

    if (!secretKey) {
        // In production if secret is not set, log warning and block
        console.error("[Turnstile] CLOUDFLARE_TURNSTILE_SECRET_KEY is not configured.");
        return { success: false, error: "Spam verification service is temporarily unconfigured." };
    }

    try {
        const formData = new URLSearchParams();
        formData.append("secret", secretKey);
        formData.append("response", token);
        if (remoteIp) {
            formData.append("remoteip", remoteIp);
        }

        const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (!res.ok) {
            return {
                success: false,
                error: `Turnstile verification request failed with status ${res.status}`,
            };
        }

        const data = await res.json();

        if (!data.success) {
            return {
                success: false,
                error: "Verification failed. Please complete the security check again.",
                errorCodes: data["error-codes"],
            };
        }

        return {
            success: true,
            hostname: data.hostname,
            challengeTs: data.challenge_ts,
        };
    } catch (err) {
        console.error("[Turnstile] Error verifying token:", err);
        return {
            success: false,
            error: "Unable to verify security token. Please try again.",
        };
    }
}
