"use server"

import { auth } from "@/lib/auth/config"
import { cookies } from "next/headers"

/**
 * Signs in with the server-only bootstrap password, immediately changes it to
 * the admin's chosen password, and sets the resulting session cookies.
 *
 * The bootstrap password (SUPERADMIN_BOOTSTRAP_PASSWORD) never reaches the
 * client bundle — it only lives in Vercel env vars.
 *
 * Returns the new session token so the client can stay authenticated through
 * the 2FA and NDA steps that follow.
 */
export async function bootstrapAdminSetPassword(
    email: string,
    newPassword: string,
): Promise<void> {
    const bootstrapPassword = process.env.SUPERADMIN_BOOTSTRAP_PASSWORD
    if (!bootstrapPassword) {
        throw new Error("SUPERADMIN_BOOTSTRAP_PASSWORD is not configured on the server.")
    }

    // Step 1 — sign in with the bootstrap password
    const signInRes = await auth.api.signInEmail({
        body: { email, password: bootstrapPassword },
        asResponse: true,
    })

    if (!signInRes.ok) {
        throw new Error("Bootstrap sign-in failed. Has the seed script been run for this environment?")
    }

    // Step 2 — extract the session token from the sign-in response cookies
    //           so we can authenticate the changePassword call
    const signInCookies = signInRes.headers.getSetCookie()
    const sessionCookieRaw = signInCookies.find(c => c.startsWith("better-auth.session_token="))
    const sessionToken = sessionCookieRaw?.split(";")[0].split("=")[1]

    // Step 3 — change the password server-side using the fresh session
    const changeRes = await auth.api.changePassword({
        body: {
            currentPassword: bootstrapPassword,
            newPassword,
            revokeOtherSessions: true,
        },
        headers: new Headers({
            cookie: `better-auth.session_token=${sessionToken}`,
        }),
        asResponse: true,
    })

    if (!changeRes.ok) {
        throw new Error("Password change failed.")
    }

    // Step 4 — forward the new session cookies to the browser so the client
    //           can continue with 2FA setup using authClient.*
    const jar = await cookies()
    for (const raw of changeRes.headers.getSetCookie()) {
        const [kv, ...attrs] = raw.split(";").map(s => s.trim())
        const eq = kv.indexOf("=")
        const name = kv.slice(0, eq)
        const value = kv.slice(eq + 1)

        const opts: Parameters<typeof jar.set>[2] = {}
        for (const attr of attrs) {
            const [k, v] = attr.split("=").map(s => s.trim())
            switch (k.toLowerCase()) {
                case "httponly":  opts.httpOnly = true; break
                case "secure":    opts.secure   = true; break
                case "path":      opts.path     = v;    break
                case "max-age":   opts.maxAge   = Number(v); break
                case "samesite":  opts.sameSite = v.toLowerCase() as "lax" | "strict" | "none"; break
            }
        }
        jar.set(name, value, opts)
    }
}
