"use server";

import { db } from "@/lib/db";
import { users, inviteLinks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { EmailService } from "@/lib/email/service";

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
    } catch (err: any) {
        return { success: false, error: err.message };
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
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * SuperAdmin creates a moderator invite: generates token, stores it, sends email.
 */
export async function createModeratorInvite(
    inviterId: string,
    inviteeEmail: string,
    moderationScope: string
) {
    try {
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await db.insert(inviteLinks).values({
            inviterId,
            token,
            roleAssigned: "Moderator",
            inviteeEmail,
            moderationScope,
            isUsed: false,
            expiresAt,
        });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const inviteUrl = `${appUrl}/moderator-invite/${token}`;

        // Fire-and-forget email
        EmailService.sendModeratorInvitation(
            inviteeEmail,
            inviteeEmail.split("@")[0],
            "SuperAdmin",
            [moderationScope],
            inviteUrl
        ).catch((err) => console.error("Moderator invite email failed:", err));

        return { success: true, inviteUrl };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Sets the role on a newly created user (called server-side after signUp,
 * since Better Auth blocks role from being set by the client).
 */
export async function setUserRole(
    userId: string,
    role: "Mentee" | "Mentor" | "CorporatePartner" | "Moderator" | "SuperAdmin"
) {
    try {
        await db.update(users).set({ role } as any).where(eq(users.id, userId));
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Sets the moderationScope on a moderator user after accepting their invite.
 */
export async function setModeratorScope(userId: string, scope: string) {
    try {
        await db.update(users).set({ moderationScope: scope } as any).where(eq(users.id, userId));
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Saves role-specific registration metadata (meetingPreference, orgType, etc.)
 */
export async function saveUserMetadata(userId: string, metadata: Record<string, string>) {
    try {
        await db.update(users).set({ metadata }).where(eq(users.id, userId));
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
