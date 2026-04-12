import {
    HERO_BANNER,
    BUTTON,
    DIVIDER,
    INFO_ROW,
    EMAIL_SHELL_START,
    EMAIL_HEADER,
    EMAIL_FOOTER,
    EMAIL_SHELL_END
} from './index';

const wrap = (subject: string, content: string) =>
    EMAIL_SHELL_START(subject) + EMAIL_HEADER + content + EMAIL_FOOTER() + EMAIL_SHELL_END;

// T01: REGISTRATION CONFIRMATION
export const registrationConfirmationEmail = (firstName: string, role: string, verifyUrl: string) => {
    const subject = `Welcome to Jenga365, ${firstName} — Let's get started`;
    const content = `
    ${HERO_BANNER('#BB0000', '🎉', 'REGISTRATION CONFIRMED', 'Welcome to the Jenga365 Community')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#1A1A1A;margin:0 0 8px;">Hello, ${firstName}.</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          Your registration as a <strong style="color:#BB0000;">${role}</strong> on Jenga365 has been received. We're thrilled to have you with us.
        </p>
        
        <p style="font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:0 0 16px;">WHAT HAPPENS NEXT</p>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-left:3px solid #BB0000;background:#FFF0F0;padding:16px;">
          <tr>
            <td style="width:32px;vertical-align:top;">
              <span style="display:inline-block;width:24px;height:24px;background:#BB0000;color:#FFFFFF;font-size:12px;font-family:Courier New,monospace;text-align:center;line-height:24px;font-weight:700;">1</span>
            </td>
            <td style="vertical-align:top;padding-left:12px;">
              <p style="margin:0;font-size:12px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:2px;">VERIFY YOUR EMAIL — ACTION REQUIRED</p>
              <p style="margin:4px 0 0;font-size:13px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;line-height:1.6;">Click the button below to verify your email address. This link expires in 24 hours.</p>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-left:3px solid #D0CBC0;padding:16px;">
          <tr>
            <td style="width:32px;vertical-align:top;">
              <span style="display:inline-block;width:24px;height:24px;border:2px solid #D0CBC0;color:#8A8A8A;font-size:12px;font-family:Courier New,monospace;text-align:center;line-height:20px;font-weight:700;">2</span>
            </td>
            <td style="vertical-align:top;padding-left:12px;">
              <p style="margin:0;font-size:12px;color:#8A8A8A;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:2px;">SIGN YOUR PLATFORM AGREEMENT</p>
              <p style="margin:4px 0 0;font-size:13px;color:#8A8A8A;font-family:Helvetica,Arial,sans-serif;">After email verification, you will be asked to read and sign the platform agreement.</p>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;border-left:3px solid #D0CBC0;padding:16px;">
          <tr>
            <td style="width:32px;vertical-align:top;">
              <span style="display:inline-block;width:24px;height:24px;border:2px solid #D0CBC0;color:#8A8A8A;font-size:12px;font-family:Courier New,monospace;text-align:center;line-height:20px;font-weight:700;">3</span>
            </td>
            <td style="vertical-align:top;padding-left:12px;">
              <p style="margin:0;font-size:12px;color:#8A8A8A;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:2px;">ACCESS YOUR DASHBOARD</p>
              <p style="margin:4px 0 0;font-size:13px;color:#8A8A8A;font-family:Helvetica,Arial,sans-serif;">
                ${role === 'Mentee' ? 'Mentees get instant access after signing the agreement.' : 'Await moderator review. We review within 48 hours.'}
              </p>
            </td>
          </tr>
        </table>

        ${BUTTON('Verify My Email →', verifyUrl, 'primary')}
        
        <p style="font-size:11px;color:#8A8A8A;font-family:Courier New,monospace;text-align:center;margin:32px 0 32px;">
          This link expires in 24 hours · If you didn't register, ignore this email.
        </p>

        ${DIVIDER}

        <p style="font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:24px 0 16px;">WHAT AWAITS YOU</p>
        ${INFO_ROW('🏉', 'Access mentors, clinics, and webinars across Kenya')}
        ${INFO_ROW('📚', 'Read and write articles in our community knowledge base')}
        ${INFO_ROW('🌱', 'Participate in The Green Game impact activities')}
        ${INFO_ROW('🎯', 'Track your learning pathway and milestone progress')}
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T02: EMAIL VERIFICATION
export const emailVerificationEmail = (firstName: string, verifyUrl: string, token: string) => {
    const subject = 'Verify your email — Jenga365';
    const content = `
    ${HERO_BANNER('#BB0000', '✉️', 'ACTION REQUIRED', 'Confirm Your Email Address')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hi ${firstName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 32px;">
          You're one step away from joining the Jenga365 community. Click the button below to verify your email and continue your registration.
        </p>
        ${BUTTON('Verify My Email →', verifyUrl, 'primary')}
        <p style="font-size:12px;color:#8A8A8A;font-family:Courier New,monospace;text-align:center;margin:24px 0;">
          Or paste this link in your browser:<br>
          <span style="color:#BB0000;word-break:break-all;">${verifyUrl}</span>
        </p>
        ${DIVIDER}
        <table cellpadding="0" cellspacing="0" style="background:#FFF8E8;border-left:3px solid #996600;padding:16px;margin:32px 0;width:100%;">
          <tr>
            <td>
              <p style="margin:0;font-size:12px;color:#996600;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:2px;">SECURITY NOTE</p>
              <p style="margin:8px 0 0;font-size:13px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;line-height:1.6;">
                This link expires in 24 hours. If you did not create a Jenga365 account, please ignore this email safely.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T03: PENDING APPROVAL — MENTOR
export const pendingApprovalMentorEmail = (firstName: string, fullName: string, title: string, submittedAt: string) => {
    const subject = "Application received — We'll review within 48 hours";
    const content = `
    ${HERO_BANNER('#1A1A1A', '🔍', 'APPLICATION RECEIVED', 'Your Mentor Application Is Under Review')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${firstName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          Thank you for applying to become a Jenga365 Mentor. Our moderation team reviews every mentor application personally to ensure the safety and quality of our community.
        </p>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border:1px solid #E8E4DC;border-left:4px solid #BB0000;padding:24px;margin:24px 0;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;">YOUR APPLICATION SUMMARY</p>
              <p style="margin:0;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;">${fullName}</p>
              <p style="margin:4px 0 16px;font-size:12px;color:#8A8A8A;font-family:Courier New,monospace;">${title}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:50%;padding-right:8px;">
                    <p style="margin:0;font-size:11px;color:#8A8A8A;font-family:Courier New,monospace;text-transform:uppercase;">SUBMITTED</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#1A1A1A;font-family:Helvetica,Arial,sans-serif;">${submittedAt}</p>
                  </td>
                  <td style="width:50%;padding-left:8px;">
                    <p style="margin:0;font-size:11px;color:#8A8A8A;font-family:Courier New,monospace;text-transform:uppercase;">NDA STATUS</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#006600;font-family:Helvetica,Arial,sans-serif;">✓ Signed</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <p style="font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:24px 0 16px;">REVIEW PROGRESS</p>
        ${INFO_ROW('✅', '<strong>Application Submitted</strong><br>Your profile and credentials have been received.')}
        ${INFO_ROW('🟡', '<strong>Moderator Review (In Progress)</strong><br>Our team is reviewing your professional background and NDA signature.')}
        ${INFO_ROW('⚪', '<strong>Email Notification</strong><br>You will receive an approval or feedback email.')}

        ${DIVIDER}
        <p style="font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:24px 0 16px;">WHILE YOU WAIT</p>
        ${INFO_ROW('📖', 'Browse our public articles at jenga365.com/articles')}
        ${INFO_ROW('🏉', 'See upcoming events at jenga365.com/events')}
        
        <div style="margin-top:24px;">
           ${BUTTON('Edit My Profile →', '/pending-approval', 'ghost')}
        </div>
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T04: PENDING APPROVAL — CORPORATE PARTNER
export const pendingApprovalCorporateEmail = (firstName: string, orgName: string, submittedAt: string) => {
    const subject = "Partnership application received — Jenga365";
    const content = `
    ${HERO_BANNER('#1A1A1A', '🤝', 'PARTNERSHIP APPLICATION', 'Your Application Is Being Reviewed')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${firstName} at ${orgName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          Thank you for applying to become a Jenga365 Corporate Partner. We review every partnership application to ensure alignment with our values and mission. You will hear from us within 3 business days.
        </p>
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;border:1px solid #E8E4DC;border-left:4px solid #1A1A1A;padding:24px;margin:24px 0;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;">PARTNERSHIP SUMMARY</p>
              <p style="margin:0;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;">${orgName}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;">Submitted: ${submittedAt}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#006600;font-family:Helvetica,Arial,sans-serif;">Agreement: ✓ Signed</p>
            </td>
          </tr>
        </table>

        ${INFO_ROW('✅', 'Application Submitted')}
        ${INFO_ROW('✅', 'Partnership Agreement Signed')}
        ${INFO_ROW('🟡', 'Moderator Review (In Progress)')}
        ${INFO_ROW('⚪', 'Admin Approval')}

        <div style="margin-top:24px;">
          ${BUTTON('Explore Jenga365 →', 'https://jenga365.com', 'ghost')}
        </div>
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T05: MENTOR APPROVED
export const mentorApprovedEmail = (firstName: string, email: string) => {
    const subject = "🎉 You're approved — Welcome to the Jenga365 mentor team";
    const content = `
    ${HERO_BANNER('#006600', '✅', 'APPLICATION APPROVED', 'You Are Now a Jenga365 Mentor')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Congratulations, ${firstName}!</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          We are thrilled to welcome you to the Jenga365 mentor community. Your application has been reviewed and approved. You can now access your mentor dashboard and begin making an impact.
        </p>
        
        <table style="border-left:4px solid #006600;background:#F0FFF0;padding:24px;margin:24px 0;width:100%;">
          <tr><td>
            <p style="font-size:10px;color:#006600;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px;">YOUR ACCOUNT IS NOW ACTIVE</p>
            <p style="margin:0;font-size:14px;color:#1A1A1A;font-family:Helvetica,Arial,sans-serif;">Access type: Mentor Dashboard</p>
            <p style="margin:4px 0 0;font-size:14px;color:#1A1A1A;font-family:Helvetica,Arial,sans-serif;">Username: ${email}</p>
          </td></tr>
        </table>

        ${BUTTON('Access My Mentor Dashboard →', '/dashboard/mentor', 'success')}

        <p style="font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:32px 0 16px;">YOUR FIRST STEPS</p>
        ${INFO_ROW('👤', 'Complete your public mentor profile')}
        ${INFO_ROW('📅', 'Set your availability for mentee sessions')}
        ${INFO_ROW('✏', 'Write your first article to build visibility')}
        ${INFO_ROW('🏉', 'Register to coach at an upcoming clinic')}
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T06: MENTOR REJECTED (RETURNED)
export const mentorRejectedEmail = (firstName: string, feedback: string, reapplyDate: string) => {
    const subject = "Your Jenga365 mentor application — Update";
    const content = `
    ${HERO_BANNER('#1A1A1A', '📋', 'APPLICATION UPDATE', 'Thank You for Your Application')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${firstName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          Thank you for your interest in becoming a Jenga365 Mentor. After careful review, our moderation team has returned your application with some feedback. This is not a permanent rejection — you are welcome to reapply in 30 days.
        </p>
        
        <table style="border-left:4px solid #996600;background:#FFF8E8;padding:24px;margin:24px 0;width:100%;">
          <tr><td>
            <p style="font-size:10px;color:#996600;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">MODERATOR FEEDBACK</p>
            <p style="font-size:14px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;line-height:1.8;margin:0;">${feedback}</p>
          </td></tr>
        </table>

        ${INFO_ROW('📝', 'Review the feedback above carefully')}
        ${INFO_ROW('🔄', `You may reapply after ${reapplyDate}`)}
        ${INFO_ROW('📧', 'Contact us if you have any questions')}

        <div style="margin-top:24px;">
          ${BUTTON('Contact Support →', 'mailto:info@jenga365.com', 'ghost')}
        </div>
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T07: CORPORATE APPROVED
export const corporateApprovedEmail = (firstName: string, orgName: string) => {
    const subject = `Partnership activated — Welcome to Jenga365, ${orgName}`;
    const content = `
    ${HERO_BANNER('#006600', '🌟', 'PARTNERSHIP ACTIVATED', 'Welcome to the Jenga365 Partner Family')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${firstName} and the ${orgName} team,</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          Your corporate partnership with Jenga365 has been approved and activated. Your organisation's logo is now live on the Jenga365 platform. Welcome to the partner family.
        </p>
        
        <div style="margin-bottom:32px;">
          ${BUTTON('Access Partner Dashboard →', '/dashboard/partner', 'success')}
        </div>

        ${DIVIDER}
        <p style="font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:24px 0 16px;">NEXT STEPS</p>
        ${INFO_ROW('💰', 'Browse upcoming events for sponsorship')}
        ${INFO_ROW('👥', 'Invite employees to mentor on the platform')}
        ${INFO_ROW('📊', 'Track your CSR impact in real time')}
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T08: NDA SIGNED CONFIRMATION
export const ndaSignedConfirmationEmail = (firstName: string, role: string, fullName: string, timestamp: string, hash: string, signatureId: string) => {
    const subject = `Agreement signed — Your Jenga365 ${role} Agreement`;
    const content = `
    ${HERO_BANNER('#1A1A1A', '📝', 'AGREEMENT CONFIRMED', 'Your Agreement Has Been Signed')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${firstName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          This email confirms that you have digitally signed the Jenga365 ${role} Agreement. Please keep this email for your records.
        </p>
        
        <table style="border:1px solid #E8E4DC;background:#FAFAF8;padding:24px;margin:24px 0;width:100%;">
          <tr><td>
            <p style="font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:0 0 16px;">SIGNATURE RECORD</p>
            <p style="margin:4px 0;font-size:13px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;"><strong>Document:</strong> ${role} Agreement v2025.06.1</p>
            <p style="margin:4px 0;font-size:13px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;"><strong>Signed by:</strong> ${fullName}</p>
            <p style="margin:4px 0;font-size:13px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;"><strong>Date:</strong> ${timestamp}</p>
            <p style="margin:4px 0;font-size:11px;color:#8A8A8A;font-family:Courier New,monospace;word-break:break-all;"><strong>Hash:</strong> ${hash}</p>
            <p style="margin:4px 0;font-size:11px;color:#8A8A8A;font-family:Courier New,monospace;"><strong>ID:</strong> ${signatureId}</p>
          </td></tr>
        </table>

        <p style="font-size:12px;color:#8A8A8A;font-family:Courier New,monospace;text-align:center;line-height:1.8;margin:16px 0;">
          This signature is legally binding under Kenyan law.<br>Retain this email as proof of your agreement.
        </p>
        ${BUTTON('View Agreement →', '/legal/nda/history', 'ghost')}
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T09: MENTOR REQUEST RECEIVED
export const mentorRequestReceivedEmail = (mentorFirstName: string, menteeName: string, matchScore: number, goal: string) => {
    const subject = `${menteeName} wants you as their mentor — Jenga365`;
    const content = `
    ${HERO_BANNER('#BB0000', '🤝', 'NEW MENTOR REQUEST', 'Someone Wants You as Their Mentor')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${mentorFirstName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          A mentee has sent you a connection request on Jenga365. Here is a summary of who they are and why they think you're a great match.
        </p>
        
        <table style="border-left:4px solid #BB0000;background:#FFF0F0;padding:24px;margin:24px 0;width:100%;">
          <tr><td>
            <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 4px;">${menteeName}</p>
            <p style="font-size:11px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;margin:0 0 16px;">Mentee</p>
            <p style="font-size:11px;color:#8A8A8A;font-family:Courier New,monospace;text-transform:uppercase;">MATCH SCORE</p>
            <p style="font-family:Georgia,serif;font-size:22px;font-weight:900;color:#BB0000;">${matchScore}%</p>
            <p style="margin:12px 0 0;font-size:14px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;"><strong>6-month goal:</strong> "${goal}"</p>
          </td></tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="48%" align="center">${BUTTON('✓ Accept', '/dashboard/mentor/requests', 'success')}</td>
            <td width="4%"></td>
            <td width="48%" align="center">${BUTTON('View Profile', '/dashboard/mentor/requests', 'ghost')}</td>
          </tr>
        </table>
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T10: MENTOR REQUEST ACCEPTED
export const mentorRequestAcceptedEmail = (menteeFirstName: string, mentorName: string, title: string) => {
    const subject = "Your mentor request was accepted — Jenga365";
    const content = `
    ${HERO_BANNER('#006600', '🎉', 'REQUEST ACCEPTED', `${mentorName} Is Now Your Mentor`)}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Congratulations, ${menteeFirstName}!</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          Your mentor request has been accepted. ${mentorName} is excited to support your journey. You can now message your mentor and schedule your first session.
        </p>
        
        <div style="margin-bottom:32px;">
          ${BUTTON('View My Dashboard →', '/dashboard/mentee', 'success')}
        </div>

        ${INFO_ROW('📅', 'Schedule your first session within 7 days')}
        ${INFO_ROW('🎯', 'Your learning pathway has been activated')}
        ${INFO_ROW('📚', 'Access resources shared by your mentor')}
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T11: ARTICLE PUBLISHED
export const articlePublishedEmail = (authorName: string, title: string, slug: string) => {
    const subject = "Your article is live on Jenga365 🎉";
    const content = `
    ${HERO_BANNER('#006600', '📰', 'ARTICLE PUBLISHED', 'Your Article Is Live')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${authorName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          Your article "<strong>${title}</strong>" has been reviewed and published to the Jenga365 community. Thank you for contributing to our knowledge base.
        </p>
        ${BUTTON('View My Article →', `/articles/${slug}`, 'success')}
        <div style="margin-top:32px;">
          ${INFO_ROW('🔗', 'Share your article on social media')}
          ${INFO_ROW('📊', 'Track views from your dashboard')}
        </div>
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T12: ARTICLE RETURNED
export const articleReturnedEmail = (authorName: string, title: string, feedback: string) => {
    const subject = "Your article needs a few changes — Jenga365";
    const content = `
    ${HERO_BANNER('#996600', '🖊', 'ARTICLE RETURNED', 'Your Article Needs Some Adjustments')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${authorName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          Thank you for your submission. Our content team has reviewed your article and returned it with some suggestions.
        </p>
        
        <table style="border-left:4px solid #996600;background:#FFF8E8;padding:24px;margin:24px 0;width:100%;">
          <tr><td>
            <p style="font-size:10px;color:#996600;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">EDITOR FEEDBACK</p>
            <p style="font-size:14px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;line-height:1.8;margin:0;">${feedback}</p>
          </td></tr>
        </table>

        ${BUTTON('Edit & Resubmit →', '/dashboard/articles', 'primary')}
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T13: EVENT REGISTRATION
export const eventRegistrationEmail = (firstName: string, eventName: string, type: string, date: string, time: string, location: string) => {
    const subject = `You're registered — ${eventName}`;
    const icon = type === 'Webinar' ? '💻' : '🏉';
    const content = `
    ${HERO_BANNER('#BB0000', icon, 'REGISTRATION CONFIRMED', "See You There")}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${firstName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">Your registration for ${eventName} has been confirmed. Here are your event details.</p>
        
        <table style="border-left:4px solid #BB0000;background:#FFF0F0;padding:24px;margin:24px 0;width:100%;">
          <tr><td>
            <p style="margin:0;font-family:Georgia,serif;font-size:20px;font-weight:900;">${eventName}</p>
            <p style="margin:8px 0 0;font-size:14px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;"><strong>Date:</strong> ${date}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;"><strong>Time:</strong> ${time}</p>
            <p style="margin:4px 0 0;font-size:14px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;"><strong>Location:</strong> ${location}</p>
          </td></tr>
        </table>
        ${BUTTON('Add to Calendar', '#', 'primary')}
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T14: DONATION THANK YOU
export const donationThankYouEmail = (firstName: string, amount: string, impact: string) => {
    const subject = "Thank you for your generosity — Jenga365";
    const content = `
    ${HERO_BANNER('#BB0000', '❤️', 'DONATION RECEIVED', 'Thank You for Changing Lives')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Dear ${firstName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          Your donation of ${amount} has been received. Your support makes a real difference in the Jenga365 community.
        </p>
        
        <table style="background:#FFF0F0;border:1px solid #E8E4DC;padding:24px;margin:24px 0;width:100%;text-align:center;">
          <tr><td>
            <p style="font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:0 0 16px;">YOUR IMPACT</p>
            <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;">${impact}</p>
          </td></tr>
        </table>
        ${BUTTON('Track Your Impact →', '/dashboard', 'primary')}
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T15: MODERATOR INVITATION
export const moderatorInvitationEmail = (firstName: string, adminName: string, scopes: string[], inviteUrl: string) => {
    const subject = "You've been invited to moderate Jenga365";
    const content = `
    ${HERO_BANNER('#1A1A1A', '🛡', 'MODERATOR INVITATION', 'Join the Moderation Team')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${firstName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          ${adminName} has invited you to join the Jenga365 moderation team. This role carries significant responsibility in maintaining the quality of our community.
        </p>
        
        <p style="font-size:10px;color:#BB0000;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:0 0 12px;">YOUR ASSIGNED SCOPE</p>
        <div style="margin-bottom:24px;">
          ${scopes.map(s => `
            <span style="display:inline-block;background:#FFF0F0;color:#990000;border:1px solid rgba(153,0,0,0.20);padding:4px 12px;font-family:Courier New,monospace;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:0 4px 4px 0;">${s}</span>
          `).join('')}
        </div>
        
        ${BUTTON('Set Up My Account →', inviteUrl, 'primary')}
        <p style="font-size:11px;color:#8A8A8A;font-family:Courier New,monospace;text-align:center;margin-top:16px;">This invitation expires in 72 hours.</p>
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T16: SESSION LOGGED
export const sessionLoggedEmail = (menteeName: string, mentorName: string, date: string, nextSteps: string) => {
    const subject = `Session logged — ${date} with ${mentorName}`;
    const content = `
    ${HERO_BANNER('#BB0000', '📅', 'SESSION LOGGED', 'Your Mentorship Session Has Been Recorded')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${menteeName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">Your mentor ${mentorName} has logged your recent session.</p>
        
        <table style="border-left:4px solid #006600;background:#F0FFF0;padding:20px;margin:24px 0;width:100%;">
          <tr><td>
            <p style="font-size:10px;color:#006600;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;margin:0 0 8px;">YOUR NEXT STEPS</p>
            <p style="font-size:14px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;line-height:1.8;">${nextSteps}</p>
          </td></tr>
        </table>
        ${BUTTON('View My Pathway →', '/dashboard/mentee', 'primary')}
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T17: PASSWORD RESET
export const passwordResetEmail = (firstName: string, resetUrl: string) => {
    const subject = "Reset your Jenga365 password";
    const content = `
    ${HERO_BANNER('#1A1A1A', '🔐', 'PASSWORD RESET', 'Reset Your Password')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${firstName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        ${BUTTON('Reset My Password →', resetUrl, 'primary')}
        <p style="font-size:11px;color:#8A8A8A;font-family:Courier New,monospace;text-align:center;margin-top:24px;">This link expires in 1 hour.</p>
      </td>
    </tr>
  `;
    return wrap(subject, content);
};

// T18: NDA UPDATE REQUIRED
export const ndaUpdateEmail = (firstName: string, role: string, version: string) => {
    const subject = "Action required — Jenga365 agreement has been updated";
    const content = `
    ${HERO_BANNER('#996600', '⚠️', 'AGREEMENT UPDATED', 'Updated Platform Agreement')}
    <tr>
      <td style="padding:40px;">
        <p style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#1A1A1A;margin:0 0 16px;">Hello ${firstName},</p>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#4A4A4A;line-height:1.8;margin:0 0 24px;">
          Jenga365 has updated its platform agreement (v${version}). As a ${role}, you are required to review and sign the new version.
        </p>
        ${BUTTON('Review & Sign →', '/legal/nda/update', 'primary')}
        <p style="font-size:12px;color:#8A8A8A;font-family:Courier New,monospace;text-align:center;margin-top:24px;">
          Access to your dashboard will be restricted until the new agreement is signed.
        </p>
      </td>
    </tr>
  `;
    return wrap(subject, content);
};
