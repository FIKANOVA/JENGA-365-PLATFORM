import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { twoFactor, admin } from "better-auth/plugins";

import * as schema from "@/lib/db/schema";

import { randomUUID } from "node:crypto";

export const auth = betterAuth({
    // Database — let Better Auth manage its own tables (user, session, account, verification)
    // via the Drizzle adapter connected to our Neon database
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
            twoFactor: schema.twoFactors
        }
    }),

    // Base URL — used for building callback URLs and cookie domains
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

    // Secret — used for signing sessions and encrypting tokens
    secret: process.env.BETTER_AUTH_SECRET,

    // Advanced - Let DB (Drizzle) generate UUIDs for us
    advanced: {
        // generateId has been removed in newer versions of better-auth,
        // relying on databaseHooks below instead.
    },

    // Email & password sign-up/sign-in
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Kept false so NDA signing works immediately after signUp
    },

    emailVerification: {
        sendVerificationEmail: async ({ user, url }) => {
            try {
                const { Resend } = await import("resend");
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL ?? "noreply@jenga365.com",
                    to: user.email,
                    subject: "Verify your Jenga365 email",
                    html: `
                        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;">
                            <h2 style="font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;margin-bottom:8px;">
                                Verify your email
                            </h2>
                            <p style="color:#666;margin-bottom:32px;">
                                Click the button below to confirm your Jenga365 account. This link expires in 1 hour.
                            </p>
                            <a href="${url}" style="display:inline-block;background:#BB0000;color:#fff;font-family:monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;padding:16px 32px;text-decoration:none;">
                                Verify Email Address
                            </a>
                            <p style="color:#999;font-size:12px;margin-top:32px;">
                                If you did not create a Jenga365 account, you can safely ignore this email.
                            </p>
                        </div>
                    `,
                });
            } catch (err) {
                console.error("[auth] Verification email failed:", err);
            }
        },
        autoSignInAfterVerification: true,
    },

    // Extend the user object with Jenga365-specific fields.
    // These are stored in Better Auth's `user` table and returned in the session.
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "Mentee",
                // Roles: "Mentee", "Mentor", "CorporatePartner", "Moderator", "SuperAdmin"
                input: true,
            },
            // Moderator Scope (stored as JSON string of scopes: "A", "B", "C", "D", "E")
            moderationScope: {
                type: "string",
                required: false,
                input: false,
            },
            isApproved: {
                type: "boolean",
                defaultValue: false,
                input: false, // set by Moderator scope A or SuperAdmin
            },
            // For Corporate users: links to their specific partner entity in Sanity/DB
            partnerId: {
                type: "string",
                required: false,
                input: false,
            },
            // NDA Tracking
            ndaSigned: {
                type: "boolean",
                defaultValue: false,
                input: false,
            },
            ndaVersion: {
                type: "string",
                required: false,
                input: false,
            },
            ndaSignedAt: {
                type: "date",
                required: false,
                input: false,
            },
            // Overall Account Status
            status: {
                type: "string",
                defaultValue: "pending",
                input: false,
            },
            // Verification status for Mentors
            isMentorVerified: {
                type: "boolean",
                defaultValue: false,
                input: false,
            },
            intakeCompleted: {
                type: "boolean",
                defaultValue: false,
                input: false,
            }
        },
    },

    // Plugins for 2FA and Verification
    plugins: [
        twoFactor(),
        admin(),
    ],

    // Database Hooks to force UUIDs if generateId is ignored
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    user.id = randomUUID();
                    console.log('>>> DATABASE HOOK GENERATED UUID:', user.id);
                    return { data: user };
                }
            }
        }
    },

    // Session configuration
    session: {
        expiresIn: 60 * 60 * 24 * 7,        // 7 days
        updateAge: 60 * 60 * 24,              // Refresh session every 24h of activity
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,                    // Cache session in cookie for 5 minutes
        },
    },

    // Trusted origins — add your production domain here before deploying
    trustedOrigins: [
        "http://localhost:3000",
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    ],
});

// Export inferred types for use in server components and actions
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;

// Extended user type with Jenga365-specific fields
export interface SessionUser extends User {
    role: string;
    partnerId?: string;
}

export interface SessionWithRole {
    user: SessionUser;
    session: Session['session'];
}
