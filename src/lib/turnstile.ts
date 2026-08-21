/**
 * Cloudflare Turnstile Server-side Token Verification Helper
 * 
 * Validates the Turnstile response token with Cloudflare's siteverify API.
 * Gracefully permits submissions when keys are not yet configured in production environment.
 */

// Cloudflare official test secret key (always passes on local test environments)
const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export interface TurnstileVerifyResult {
    success: boolean;
    error?: string;
    hostname?: string;
    challengeTs?: string;
    errorCodes?: string[];
}

export async function verifyTurnstileToken(
    token?: string | null,
    remoteIp?: string | null
): Promise<TurnstileVerifyResult> {
    const secretKey =
        process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
        (process.env.NODE_ENV === "production" ? "" : TEST_SECRET_KEY);

    // If Turnstile secret is NOT configured in the environment, bypass gracefully
    if (!secretKey) {
        return { success: true, hostname: "unconfigured-turnstile" };
    }

    if (!token || token === "unconfigured-turnstile-token") {
        return { success: false, error: "Spam verification token is required." };
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
