/**
 * Cloudflare Turnstile Server-side Token Verification Helper
 * 
 * Canonical siteverify implementation for Cloudflare Turnstile.
 * Validates the Turnstile response token with Cloudflare's siteverify API.
 * Follows Cloudflare's official integration prompt specification.
 */

export interface TurnstileVerifyResult {
    success: boolean;
    error?: string;
    hostname?: string;
    action?: string;
    challengeTs?: string;
    errorCodes?: string[];
}

export async function verifyTurnstileToken(
    token?: string | null,
    remoteIp?: string | null,
    expectedAction?: string | null
): Promise<TurnstileVerifyResult> {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    // If Turnstile secret is NOT configured in the environment, bypass gracefully for staging
    if (!secretKey) {
        return { success: true, hostname: "unconfigured-turnstile" };
    }

    if (!token || typeof token !== "string" || token.trim() === "" || token === "unconfigured-turnstile-token") {
        return { success: false, error: "Spam verification token is required." };
    }

    try {
        const formData = new URLSearchParams();
        formData.append("secret", secretKey);
        formData.append("response", token.trim());
        if (remoteIp) {
            formData.append("remoteip", remoteIp);
        }

        const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            signal: AbortSignal.timeout(10_000),
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

        if (expectedAction && data.action && data.action !== expectedAction) {
            return {
                success: false,
                error: `Turnstile action mismatch (expected ${expectedAction}, got ${data.action}).`,
            };
        }

        return {
            success: true,
            hostname: data.hostname,
            action: data.action,
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
