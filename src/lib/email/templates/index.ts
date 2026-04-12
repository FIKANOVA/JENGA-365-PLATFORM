/**
 * Jenga365 Email Design System - Base Components
 * All templates use inline CSS for maximum compatibility.
 */

export const EMAIL_SHELL_START = (subject: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .email-padding { padding: 20px !important; }
      .stack-column { display: block !important; width: 100% !important; }
      .hero-heading { font-size: 24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F7F5F0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F7F5F0;padding:40px 0;">
    <tr>
      <td align="center">
        <table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E8E4DC;">
`;

export const EMAIL_SHELL_END = `
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const EMAIL_HEADER = `
<tr>
  <td style="background-color:#1A1A1A;padding:24px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <span style="font-family:Georgia,serif;font-size:22px;font-style:italic;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">Jenga365</span>
          <span style="font-size:11px;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;color:#BB0000;margin-left:16px;">Platform</span>
        </td>
        <td align="right">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:20px;height:4px;background:#BB0000;"></td>
              <td style="width:4px;"></td>
              <td style="width:20px;height:4px;background:#FFFFFF;"></td>
              <td style="width:4px;"></td>
              <td style="width:20px;height:4px;background:#006600;"></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

export const EMAIL_FOOTER = (unsubscribeUrl: string = '#') => `
<tr>
  <td style="background-color:#1A1A1A;padding:32px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding-bottom:16px;">
          <a href="https://x.com/jenga365" style="color:#8A8A8A;text-decoration:none;font-size:11px;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:2px;margin:0 12px;">X (Twitter)</a>
          <a href="https://instagram.com/jenga365" style="color:#8A8A8A;text-decoration:none;font-size:11px;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:2px;margin:0 12px;">Instagram</a>
          <a href="https://linkedin.com/company/jenga365" style="color:#8A8A8A;text-decoration:none;font-size:11px;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:2px;margin:0 12px;">LinkedIn</a>
        </td>
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
          <p style="margin:0;font-size:11px;color:#4A4A4A;font-family:Courier New,monospace;text-align:center;line-height:1.8;">
            © 2025 Jenga365 · Nairobi, Kenya<br>
            <a href="mailto:info@jenga365.com" style="color:#BB0000;text-decoration:none;">info@jenga365.com</a> · +254-741-058-917
          </p>
          <p style="margin:12px 0 0;font-size:10px;color:#4A4A4A;font-family:Courier New,monospace;text-align:center;">
            <a href="${unsubscribeUrl}" style="color:#4A4A4A;text-decoration:underline;">Unsubscribe</a> · 
            <a href="https://jenga365.com/privacy" style="color:#4A4A4A;text-decoration:underline;">Privacy Policy</a>
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

export const HERO_BANNER = (color: string, icon: string, label: string, heading: string) => `
<tr>
  <td style="background-color:${color};padding:48px 40px;text-align:center;">
    <div style="font-size:48px;margin-bottom:16px;">${icon}</div>
    <p style="margin:0 0 8px;font-size:10px;color:rgba(255,255,255,0.70);font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:3px;">${label}</p>
    <h1 class="hero-heading" style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:900;color:#FFFFFF;line-height:1.2;">${heading}</h1>
  </td>
</tr>
`;

export const BUTTON = (text: string, url: string, type: 'primary' | 'success' | 'ghost' = 'primary') => {
    let bgColor = '#BB0000';
    let borderColor = '#BB0000';
    let textColor = '#FFFFFF';

    if (type === 'success') {
        bgColor = '#006600';
        borderColor = '#006600';
    } else if (type === 'ghost') {
        bgColor = 'transparent';
        borderColor = '#D0CBC0';
        textColor = '#1A1A1A';
    }

    return `
<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
  <tr>
    <td style="background-color:${bgColor};border:2px solid ${borderColor};">
      <a href="${url}" style="display:block;padding:14px 32px;color:${textColor};text-decoration:none;font-size:12px;font-family:Courier New,monospace;text-transform:uppercase;letter-spacing:2.5px;font-weight:700;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`;
};

export const DIVIDER = `
<tr>
  <td style="padding:0 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="border-top:1px solid #E8E4DC;"></td>
      </tr>
    </table>
  </td>
</tr>
`;

export const INFO_ROW = (emoji: string, content: string) => `
<tr>
  <td style="padding:12px 40px;">
    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:top;padding-right:12px;font-size:18px;">${emoji}</td>
        <td style="vertical-align:top;font-size:14px;color:#4A4A4A;font-family:Helvetica,Arial,sans-serif;line-height:1.7;">
          ${content}
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

export const renderTemplate = (subject: string, content: string) => {
    return EMAIL_SHELL_START(subject) + EMAIL_HEADER + content + EMAIL_FOOTER() + EMAIL_SHELL_END;
};
