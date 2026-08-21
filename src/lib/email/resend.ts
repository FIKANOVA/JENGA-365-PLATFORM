import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export const SENDER_ADDRESSES = {
    noreply: process.env.EMAIL_FROM_NOREPLY || 'Jenga365 <noreply@jenga365.org>',
    support: process.env.EMAIL_FROM_SUPPORT || 'Jenga365 Support <support@jenga365.org>',
    partnerships: process.env.EMAIL_FROM_PARTNERSHIPS || 'Jenga365 Partnerships <partnerships@jenga365.org>',
    journal: process.env.EMAIL_FROM_JOURNAL || 'Jenga Journal <journal@jenga365.org>',
    legal: process.env.EMAIL_FROM_LEGAL || 'Jenga365 Compliance <legal@jenga365.org>',
    info: process.env.RESEND_FROM_EMAIL || 'Jenga365 <info@jenga365.org>',
} as const;

export const DEFAULT_FROM = SENDER_ADDRESSES.noreply;
