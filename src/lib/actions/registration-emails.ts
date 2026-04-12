"use server";

import { EmailService } from "@/lib/email/service";

export async function sendMenteeRegistrationEmail(
    email: string,
    firstName: string,
    lastName: string,
    hash: string,
    signatureId: string
) {
    return EmailService.sendNDASignedConfirmation(
        email,
        firstName,
        "Mentee",
        `${firstName} ${lastName}`,
        hash,
        signatureId
    ).catch((err: Error) => console.error("Mentee email delivery failed:", err));
}

export async function sendMentorRegistrationEmails(
    email: string,
    firstName: string,
    lastName: string,
    professionalTitle: string,
    hash: string,
    signatureId: string,
    submittedAt: string,
    appBaseUrl: string
) {
    return Promise.all([
        EmailService.sendRegistrationConfirmation(email, firstName, "Mentor", `${appBaseUrl}/verify-email`),
        EmailService.sendNDASignedConfirmation(email, firstName, "Mentor", `${firstName} ${lastName}`, hash, signatureId),
        EmailService.sendMentorPendingApproval(email, firstName, `${firstName} ${lastName}`, professionalTitle, submittedAt),
    ]).catch((err: Error) => console.error("Mentor email delivery failed:", err));
}

export async function sendCorporateRegistrationEmails(
    email: string,
    contactName: string,
    orgName: string,
    hash: string,
    signatureId: string,
    submittedAt: string,
    appBaseUrl: string
) {
    return Promise.all([
        EmailService.sendRegistrationConfirmation(email, contactName, "Corporate Partner", `${appBaseUrl}/verify-email`),
        EmailService.sendNDASignedConfirmation(email, contactName, "Corporate Partner", `${contactName} (${orgName})`, hash, signatureId),
        EmailService.sendCorporatePendingApproval(email, contactName, orgName, submittedAt),
    ]).catch((err: Error) => console.error("Corporate email delivery failed:", err));
}
