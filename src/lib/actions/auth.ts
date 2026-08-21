"use server";

import { db } from "@/lib/db";
import { users, inviteLinks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { EmailService } from "@/lib/email/service";
import { auth } from "@/lib/auth/config";

/**
 * Validates an invite token and returns the invitee email + role.
 * Works for both SuperAdmin setup tokens and moderator invite tokens.
 */
export async function validateAdminInvite(token: string) {
    try {
        const invite = await db.query.inviteLinks.findFirst({
            where: and(
                eq(inviteLinks.token, token),
                eq(inviteLinks.isUsed, false)
            )
        });

        if (!invite) {
            return { success: false, error: "Invalid or expired invite token" };
        }

        if (new Date() > invite.expiresAt) {
            return { success: false, error: "Invite token has expired" };
        }

        // For moderator invites, inviteeEmail is stored directly on the invite record
        if (invite.inviteeEmail) {
            return {
                success: true,
                data: {
                    email: invite.inviteeEmail,
                    name: null,
                    role: invite.roleAssigned,
                    moderationScope: invite.moderationScope ?? null,
                }
            };
        }

        // Fallback: look up the inviter (legacy SuperAdmin setup flow)
        const user = await db.query.users.findFirst({
            where: eq(users.id, invite.inviterId)
        });

        if (!user) {
            return { success: false, error: "Associated user not found" };
        }

        return {
            success: true,
            data: {
                email: user.email,
                name: user.name,
                role: invite.roleAssigned,
                moderationScope: invite.moderationScope ?? null,
            }
        };
    } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "An unknown error occurred" };
    }
}

/**
 * Marks an invite token as used after successful account setup.
 */
export async function finishAdminInvite(token: string) {
    try {
        await db.update(inviteLinks)
            .set({ isUsed: true })
            .where(eq(inviteLinks.token, token));
        return { success: true };
    } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "An unknown error occurred" };
    }
}

/**
 * SuperAdmin creates an admin or moderator invite: generates token, stores it, sends email.
 */
export async function createModeratorInvite(
    inviterId: string,
    inviteeEmail: string,
    moderationScope: string = "all",
    roleAssigned: "Moderator" | "SuperAdmin" = "Moderator"
) {
    try {
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await db.insert(inviteLinks).values({
            inviterId,
            token,
            roleAssigned,
            inviteeEmail: inviteeEmail.trim().toLowerCase(),
            moderationScope: roleAssigned === "SuperAdmin" ? "all" : moderationScope,
            isUsed: false,
            expiresAt,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (process.env.BETTER_AUTH_URL || "https://jenga365.org");
        const inviteUrl = `${appUrl}/moderator-invite/${token}`;

        // Fire-and-forget email
        EmailService.sendModeratorInvitation(
            inviteeEmail,
            inviteeEmail.split("@")[0],
            "SuperAdmin",
            [roleAssigned === "SuperAdmin" ? "SuperAdmin (Full Platform Administration)" : moderationScope],
            inviteUrl
        ).catch((err) => console.error("Admin/Moderator invite email failed:", err));

        return { success: true, inviteUrl };
    } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "An unknown error occurred" };
    }
}

/**
 * Sets the role on a newly created user (called server-side after signUp,
 * since Better Auth blocks role from being set by the client).
 */
export async function setUserRole(
    userId: string,
    role: "Mentee" | "Mentor" | "CorporatePartner" | "NGO" | "Moderator" | "SuperAdmin"
) {
    try {
        await db.update(users).set({ role } as any).where(eq(users.id, userId));
        return { success: true };
    } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "An unknown error occurred" };
    }
}

/**
 * Sets the moderationScope on a moderator user after accepting their invite.
 */
export async function setModeratorScope(userId: string, scope: string) {
    try {
        await db.update(users).set({ moderationScope: scope } as any).where(eq(users.id, userId));
        return { success: true };
    } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "An unknown error occurred" };
    }
}

/**
 * Saves role-specific registration metadata (meetingPreference, orgType, etc.)
 */
export async function saveUserMetadata(userId: string, metadata: Record<string, string>) {
    try {
        await db.update(users).set({ metadata }).where(eq(users.id, userId));
        return { success: true };
    } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "An unknown error occurred" };
    }
}

/**
 * Sets the role and automatically approves a newly created user.
 */
export async function setUserRoleAndApprove(
    userId: string,
    role: "Mentee" | "Mentor" | "CorporatePartner" | "NGO" | "Moderator" | "SuperAdmin"
) {
    try {
        await db.update(users).set({ role, isApproved: true } as any).where(eq(users.id, userId));
        return { success: true };
    } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "An unknown error occurred" };
    }
}

/**
 * Triggers a password reset email via Better Auth.
 */
export async function requestPasswordResetAction(email: string) {
    try {
        await (auth.api as any).forgetPassword({
            body: {
                email: email.trim().toLowerCase(),
                redirectTo: "/reset-password",
            }
        });
        return { success: true };
    } catch (err: unknown) {
        console.error("[requestPasswordResetAction] error:", err);
        return { success: false, error: err instanceof Error ? err.message : "Failed to send reset link" };
    }
}
