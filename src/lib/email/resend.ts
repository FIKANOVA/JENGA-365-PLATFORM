import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const DEFAULT_FROM = 'Jenga365 <noreply@jenga365.com>';
