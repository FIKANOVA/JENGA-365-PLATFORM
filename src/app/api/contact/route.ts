import { NextRequest, NextResponse } from "next/server";
import { resend, DEFAULT_FROM } from "@/lib/email/resend";

const CONTACT_RECIPIENT = process.env.CONTACT_EMAIL ?? "hello@jenga365.org";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, email, subject, message } = body as Record<string, string>;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    try {
        await resend.emails.send({
            from: DEFAULT_FROM,
            to: CONTACT_RECIPIENT,
            replyTo: email,
            subject: `[Contact Form] ${subject ?? "General Inquiry"} — ${name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1A1A1A; border-bottom: 2px solid #2D6A4F; padding-bottom: 8px;">
                        New Contact Form Submission
                    </h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Name</td>
                            <td style="padding: 8px 0;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #555;">Email</td>
                            <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; font-weight: bold; color: #555;">Subject</td>
                            <td style="padding: 8px 0;">${subject ?? "General Inquiry"}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 16px;">
                        <p style="font-weight: bold; color: #555; margin-bottom: 8px;">Message</p>
                        <p style="background: #f5f5f5; padding: 16px; border-left: 3px solid #2D6A4F; white-space: pre-wrap;">${message}</p>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
    }
}
