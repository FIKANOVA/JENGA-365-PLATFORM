import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EmailTemplateType } from '@/lib/email/service';

const VALID_TEMPLATES: EmailTemplateType[] = [
    'registration_confirmation',
    'email_verification',
    'mentor_pending_approval',
    'corporate_pending_approval',
    'mentor_approved',
    'mentor_rejected',
    'corporate_approved',
    'nda_signed_confirmation',
    'mentor_request_received',
    'mentor_request_accepted',
    'article_published',
    'article_returned',
    'event_registration',
    'donation_thank_you',
    'moderator_invitation',
    'session_logged',
    'password_reset',
    'nda_update',
];

/**
 * GET /api/email/preview?template=registration_confirmation
 * Returns the raw HTML for a template with test data (for iframe rendering)
 */
export async function GET(req: NextRequest) {
    const template = req.nextUrl.searchParams.get('template');

    if (!template || !VALID_TEMPLATES.includes(template as EmailTemplateType)) {
        return NextResponse.json(
            { error: `Invalid template. Valid: ${VALID_TEMPLATES.join(', ')}` },
            { status: 400 }
        );
    }

    const html = EmailService.getPreviewHtml(template as EmailTemplateType);

    return new NextResponse(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
        },
    });
}
