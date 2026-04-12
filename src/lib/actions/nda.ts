"use server"

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { users, ndaSignatures } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { headers } from "next/headers";
import { createNotification } from "@/lib/notifications/service";

const signNDASchema = z.object({
    signatureName: z.string().min(2).max(100),
    ndaVersion: z.string().min(1),
    role: z.enum(["Mentee", "Mentor", "CorporatePartner", "Moderator", "SuperAdmin"]),
    additionalDeclarations: z.array(z.boolean()).refine(all => all.every(v => v === true), "All declarations must be accepted"),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    documentHash: z.string().min(1),
});

export async function signNDA(payload: z.infer<typeof signNDASchema>) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const validated = signNDASchema.parse(payload);
    const user = session.user;

    // 1. Insert signature record
    await db.insert(ndaSignatures).values({
        userId: user.id,
        documentVersion: validated.ndaVersion,
        sha256Hash: validated.documentHash,
        ipAddress: validated.ipAddress || (await headers()).get("x-forwarded-for")?.split(",")[0],
        userAgent: validated.userAgent || (await headers()).get("user-agent"),
        signatureName: validated.signatureName,
        roleAtSigning: validated.role,
    });

    // 2. Update user record
    await db.update(users).set({
        ndaSigned: true,
        ndaVersion: validated.ndaVersion,
        ndaSignedAt: new Date(),
        status: validated.role === "Mentee" ? "active" : "pending",
    }).where(eq(users.id, user.id));

    // Determine redirect
    let redirectTo = "/dashboard";
    if (validated.role === "Mentee") redirectTo = "/check-email";
    else if (validated.role === "Mentor") redirectTo = "/pending-approval?role=Mentor";
    else if (validated.role === "CorporatePartner") redirectTo = "/pending-approval?role=Corporate Partner";
    else if (validated.role === "Moderator") redirectTo = "/dashboard/moderator";
    else if (validated.role === "SuperAdmin") redirectTo = "/dashboard/admin";

    // Fire-and-forget notification
    createNotification(user.id, "nda_signed", {
        title: "NDA Signed",
        body: `Your NDA (v${validated.ndaVersion}) has been recorded. Welcome to Jenga365.`,
        link: redirectTo,
    }).catch((e: Error) => console.error("[nda] Notification failed:", e));

    return { success: true, redirectTo };
}

export async function verifyNDAStatus() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) return null;

    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id)
    });

    if (!user) return null;

    return {
        signed: user.ndaSigned,
        version: user.ndaVersion,
        emailVerified: user.emailVerified,
        status: user.status,
        role: user.role
    };
}

export async function getNDADocument(role: string, _version?: string) {
    const documents: Record<string, { version: string, hash: string, content: string }> = {
        Mentee: {
            version: "2025.06.1",
            hash: "sha256-mentee-v2025-06-1-placeholder-hash",
            content: "As a Mentee, you agree to protect the privacy of your Mentors and fellow Mentees. You will not share proprietary materials provided during sessions."
        },
        Mentor: {
            version: "2025.06.1",
            hash: "sha256-mentor-v2025-06-1-placeholder-hash",
            content: "As a Mentor, you are handle sensitive developmental data and mentee identities. You must maintain absolute confidentiality regarding all Mentee stories and progress reports."
        },
        CorporatePartner: {
            version: "2025.06.1",
            hash: "sha256-corporate-v2025-06-1-placeholder-hash",
            content: "As a Corporate Partner, you have access to aggregated impact data. You agree not to disclose individual mentee data or circumvent the platform's social impact metrics."
        },
        Moderator: {
            version: "2025.06.1",
            hash: "sha256-moderator-v2025-06-1-placeholder-hash",
            content: "As a Moderator, you have elevated access to review content and activities. You must uphold the highest standards of neutrality and confidentiality regarding all user data."
        }
    };

    return documents[role] || documents.Mentee;
}
