import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'Jenga365 <info@jenga365.org>';
