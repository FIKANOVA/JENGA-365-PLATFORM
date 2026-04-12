import { resend, DEFAULT_FROM } from './resend';
import * as templates from './templates/definitions';

// ────────────────────────────────────────────────────────────
//  All 18 transactional email template types
// ────────────────────────────────────────────────────────────
export type EmailTemplateType =
    | 'registration_confirmation'   // T01
    | 'email_verification'          // T02
    | 'mentor_pending_approval'     // T03
    | 'corporate_pending_approval'  // T04
    | 'mentor_approved'             // T05
    | 'mentor_rejected'             // T06
    | 'corporate_approved'          // T07
    | 'nda_signed_confirmation'     // T08
    | 'mentor_request_received'     // T09
    | 'mentor_request_accepted'     // T10
    | 'article_published'           // T11
    | 'article_returned'            // T12
    | 'event_registration'          // T13
    | 'donation_thank_you'          // T14
    | 'moderator_invitation'        // T15
    | 'session_logged'              // T16
    | 'password_reset'              // T17
    | 'nda_update'                  // T18
    ;

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// ────────────────────────────────────────────────────────────
//  Safe wrapper — never throws, always returns EmailResult
// ────────────────────────────────────────────────────────────
async function safeSend(params: {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
}): Promise<EmailResult> {
    try {
        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM,
            to: params.to,
            subject: params.subject,
            html: params.html,
            ...(params.replyTo ? { replyTo: params.replyTo } : {}),
        });

        if (error) {
            console.error('[EmailService] Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data?.id };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown email error';
        console.error('[EmailService] Exception:', message);
        return { success: false, error: message };
    }
}

export class EmailService {
    // ──────────────────────────────────────────────────────
    //  T01: Registration Confirmation
    // ──────────────────────────────────────────────────────
    static async sendRegistrationConfirmation(to: string, firstName: string, role: string, verifyUrl: string) {
        const html = templates.registrationConfirmationEmail(firstName, role, verifyUrl);
        return safeSend({
            to,
            subject: `Welcome to Jenga365, ${firstName} — Let's get started`,
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T02: Email Verification
    // ──────────────────────────────────────────────────────
    static async sendEmailVerification(to: string, firstName: string, verifyUrl: string, token: string) {
        const html = templates.emailVerificationEmail(firstName, verifyUrl, token);
        return safeSend({
            to,
            subject: 'Verify your email — Jenga365',
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T03: Pending Approval (Mentor)
    // ──────────────────────────────────────────────────────
    static async sendMentorPendingApproval(to: string, firstName: string, fullName: string, title: string, submittedAt: string) {
        const html = templates.pendingApprovalMentorEmail(firstName, fullName, title, submittedAt);
        return safeSend({
            to,
            subject: "Application received — We'll review within 48 hours",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T04: Pending Approval (Corporate)
    // ──────────────────────────────────────────────────────
    static async sendCorporatePendingApproval(to: string, firstName: string, orgName: string, submittedAt: string) {
        const html = templates.pendingApprovalCorporateEmail(firstName, orgName, submittedAt);
        return safeSend({
            to,
            subject: "Partnership application received — Jenga365",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T05: Mentor Approved
    // ──────────────────────────────────────────────────────
    static async sendMentorApproved(to: string, firstName: string, email: string) {
        const html = templates.mentorApprovedEmail(firstName, email);
        return safeSend({
            to,
            subject: "🎉 You're approved — Welcome to the Jenga365 mentor team",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T06: Mentor Rejected (Returned)
    // ──────────────────────────────────────────────────────
    static async sendMentorRejected(to: string, firstName: string, feedback: string, reapplyDate: string) {
        const html = templates.mentorRejectedEmail(firstName, feedback, reapplyDate);
        return safeSend({
            to,
            subject: "Your Jenga365 mentor application — Update",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T07: Corporate Approved
    // ──────────────────────────────────────────────────────
    static async sendCorporateApproved(to: string, firstName: string, orgName: string) {
        const html = templates.corporateApprovedEmail(firstName, orgName);
        return safeSend({
            to,
            subject: `Partnership activated — Welcome to Jenga365, ${orgName}`,
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T08: NDA Signed Confirmation
    // ──────────────────────────────────────────────────────
    static async sendNDASignedConfirmation(to: string, firstName: string, role: string, fullName: string, hash: string, signatureId: string) {
        const timestamp = new Date().toUTCString();
        const html = templates.ndaSignedConfirmationEmail(firstName, role, fullName, timestamp, hash, signatureId);
        return safeSend({
            to,
            subject: `Agreement signed — Your Jenga365 ${role} Agreement`,
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T09: Mentor Request Received
    // ──────────────────────────────────────────────────────
    static async sendMentorRequestReceived(to: string, mentorFirstName: string, menteeName: string, matchScore: number, goal: string) {
        const html = templates.mentorRequestReceivedEmail(mentorFirstName, menteeName, matchScore, goal);
        return safeSend({
            to,
            subject: `${menteeName} wants you as their mentor — Jenga365`,
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T10: Mentor Request Accepted
    // ──────────────────────────────────────────────────────
    static async sendMentorRequestAccepted(to: string, menteeFirstName: string, mentorName: string, title: string) {
        const html = templates.mentorRequestAcceptedEmail(menteeFirstName, mentorName, title);
        return safeSend({
            to,
            subject: "Your mentor request was accepted — Jenga365",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T11: Article Published
    // ──────────────────────────────────────────────────────
    static async sendArticlePublished(to: string, authorName: string, title: string, slug: string) {
        const html = templates.articlePublishedEmail(authorName, title, slug);
        return safeSend({
            to,
            subject: "Your article is live on Jenga365 🎉",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T12: Article Returned
    // ──────────────────────────────────────────────────────
    static async sendArticleReturned(to: string, authorName: string, title: string, feedback: string) {
        const html = templates.articleReturnedEmail(authorName, title, feedback);
        return safeSend({
            to,
            subject: "Your article needs a few changes — Jenga365",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T13: Event Registration
    // ──────────────────────────────────────────────────────
    static async sendEventRegistration(to: string, firstName: string, eventName: string, type: string, date: string, time: string, location: string) {
        const html = templates.eventRegistrationEmail(firstName, eventName, type, date, time, location);
        return safeSend({
            to,
            subject: `You're registered — ${eventName}`,
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T14: Donation Thank You
    // ──────────────────────────────────────────────────────
    static async sendDonationThankYou(to: string, firstName: string, amount: string, impact: string) {
        const html = templates.donationThankYouEmail(firstName, amount, impact);
        return safeSend({
            to,
            subject: "Thank you for your generosity — Jenga365",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T15: Moderator Invitation
    // ──────────────────────────────────────────────────────
    static async sendModeratorInvitation(to: string, firstName: string, adminName: string, scopes: string[], inviteUrl: string) {
        const html = templates.moderatorInvitationEmail(firstName, adminName, scopes, inviteUrl);
        return safeSend({
            to,
            subject: "You've been invited to moderate Jenga365",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T16: Session Logged
    // ──────────────────────────────────────────────────────
    static async sendSessionLogged(to: string, menteeName: string, mentorName: string, date: string, nextSteps: string) {
        const html = templates.sessionLoggedEmail(menteeName, mentorName, date, nextSteps);
        return safeSend({
            to,
            subject: `Session logged — ${date} with ${mentorName}`,
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T17: Password Reset
    // ──────────────────────────────────────────────────────
    static async sendPasswordReset(to: string, firstName: string, resetUrl: string) {
        const html = templates.passwordResetEmail(firstName, resetUrl);
        return safeSend({
            to,
            subject: "Reset your Jenga365 password",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  T18: NDA Update Required
    // ──────────────────────────────────────────────────────
    static async sendNDAUpdateNotification(to: string, firstName: string, role: string, version: string) {
        const html = templates.ndaUpdateEmail(firstName, role, version);
        return safeSend({
            to,
            subject: "Action required — Jenga365 agreement has been updated",
            html,
        });
    }

    // ──────────────────────────────────────────────────────
    //  HTML preview (for testing pages — no actual send)
    // ──────────────────────────────────────────────────────
    static getPreviewHtml(templateType: EmailTemplateType): string {
        const previewData = EmailService.getTestData(templateType);
        switch (templateType) {
            case 'registration_confirmation':
                return templates.registrationConfirmationEmail(previewData.firstName, previewData.role, previewData.verifyUrl);
            case 'email_verification':
                return templates.emailVerificationEmail(previewData.firstName, previewData.verifyUrl, previewData.token);
            case 'mentor_pending_approval':
                return templates.pendingApprovalMentorEmail(previewData.firstName, previewData.fullName, previewData.title, previewData.submittedAt);
            case 'corporate_pending_approval':
                return templates.pendingApprovalCorporateEmail(previewData.firstName, previewData.orgName, previewData.submittedAt);
            case 'mentor_approved':
                return templates.mentorApprovedEmail(previewData.firstName, previewData.email);
            case 'mentor_rejected':
                return templates.mentorRejectedEmail(previewData.firstName, previewData.feedback, previewData.reapplyDate);
            case 'corporate_approved':
                return templates.corporateApprovedEmail(previewData.firstName, previewData.orgName);
            case 'nda_signed_confirmation':
                return templates.ndaSignedConfirmationEmail(previewData.firstName, previewData.role, previewData.fullName, previewData.timestamp, previewData.hash, previewData.signatureId);
            case 'mentor_request_received':
                return templates.mentorRequestReceivedEmail(previewData.firstName, previewData.menteeName, previewData.matchScore, previewData.goal);
            case 'mentor_request_accepted':
                return templates.mentorRequestAcceptedEmail(previewData.firstName, previewData.mentorName, previewData.title);
            case 'article_published':
                return templates.articlePublishedEmail(previewData.authorName, previewData.title, previewData.slug);
            case 'article_returned':
                return templates.articleReturnedEmail(previewData.authorName, previewData.title, previewData.feedback);
            case 'event_registration':
                return templates.eventRegistrationEmail(previewData.firstName, previewData.eventName, previewData.type, previewData.date, previewData.time, previewData.location);
            case 'donation_thank_you':
                return templates.donationThankYouEmail(previewData.firstName, previewData.amount, previewData.impact);
            case 'moderator_invitation':
                return templates.moderatorInvitationEmail(previewData.firstName, previewData.adminName, previewData.scopes, previewData.inviteUrl);
            case 'session_logged':
                return templates.sessionLoggedEmail(previewData.menteeName, previewData.mentorName, previewData.date, previewData.nextSteps);
            case 'password_reset':
                return templates.passwordResetEmail(previewData.firstName, previewData.resetUrl);
            case 'nda_update':
                return templates.ndaUpdateEmail(previewData.firstName, previewData.role, previewData.version);
            default:
                return '<p>Unknown template type</p>';
        }
    }

    // ──────────────────────────────────────────────────────
    //  Test data for each template type
    // ──────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getTestData(templateType: EmailTemplateType): Record<string, any> {
        const base = {
            firstName: 'Amani',
            email: 'amani@jenga365.com',
            fullName: 'Amani Wangari',
            role: 'Mentor',
            verifyUrl: 'https://jenga365.com/verify-email/test-token-123',
            token: 'test-token-123',
            title: 'Rugby Development Coach',
            submittedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            orgName: 'Safaricom Foundation',
            feedback: 'Please provide more details about your coaching certifications and add a professional photo to your profile.',
            reapplyDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            hash: 'sha256:a1b2c3d4e5f6789012345678abcdef',
            signatureId: 'SIG-2025-001234',
            timestamp: new Date().toUTCString(),
            menteeName: 'Kipchoge Keino',
            matchScore: 87,
            goal: 'Master defensive line techniques and become captain of my school team within 6 months',
            mentorName: 'Amani Wangari',
            authorName: 'Amani Wangari',
            slug: 'building-character-through-rugby',
            eventName: 'Nairobi Youth Rugby Clinic',
            type: 'Clinic',
            date: 'Saturday, 15 April 2025',
            time: '09:00 AM — 12:00 PM (EAT)',
            location: 'RFUEA Grounds, Ngong Road, Nairobi',
            amount: 'KES 5,000',
            impact: 'Your donation provides rugby equipment for 5 youth players for an entire season.',
            adminName: 'Super Admin',
            scopes: ['Content Moderation', 'User Approvals', 'Event Management'],
            inviteUrl: 'https://jenga365.com/admin-setup/invite-token-456',
            mentorFirstName: 'Amani',
            nextSteps: '1. Practice the tackle drills we reviewed\n2. Watch the video analysis shared in your dashboard\n3. Complete the fitness log by Friday',
            resetUrl: 'https://jenga365.com/reset-password/reset-token-789',
            version: '2025.06.2',
        };
        return base;
    }
}
