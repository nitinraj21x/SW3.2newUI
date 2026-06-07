/**
 * email.js — Nodemailer transporter + email templates
 * All user-supplied values are HTML-escaped before interpolation.
 */
import nodemailer from 'nodemailer';

/** Escape HTML entities — prevents injection in email templates */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

/** Send a 6-digit OTP to a t-3 client (valid 10 minutes) */
export async function sendClientOtp(toEmail, otp, clientName) {
  await transporter.sendMail({
    from:    `"Sewing Circle Portal" <${process.env.EMAIL_FROM}>`,
    to:      toEmail,
    subject: 'Your Sewing Circle Portal Access Code',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
        <h2 style="color:#0f172a;margin:0 0 8px;">Your access code</h2>
        <p style="color:#475569;margin:0 0 24px;">
          Hi ${esc(clientName) || 'there'},<br/>
          Use the code below to sign in to the Sewing Circle candidate portal.
          This code expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#0f172a;">${esc(otp)}</span>
        </div>
        <p style="color:#94a3b8;font-size:13px;margin:0;">
          If you did not request this code, ignore this email.<br/>
          Do not share this code with anyone.
        </p>
      </div>`,
  });
}

/** Send a welcome email when t-1 creates a new t-3 client account */
export async function sendClientWelcome(toEmail, clientName) {
  await transporter.sendMail({
    from:    `"Sewing Circle Portal" <${process.env.EMAIL_FROM}>`,
    to:      toEmail,
    subject: 'You have been granted access to the Sewing Circle Portal',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
        <h2 style="color:#0f172a;margin:0 0 8px;">Welcome, ${esc(clientName) || 'there'}</h2>
        <p style="color:#475569;margin:0 0 16px;">
          You have been granted access to the Sewing Circle candidate portal.<br/>
          To sign in, visit the portal and enter your email address —
          a one-time code will be sent to your inbox.
        </p>
        <a href="${process.env.FRONTEND_ORIGIN}/portal"
           style="display:inline-block;background:#06b6d4;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Go to Portal
        </a>
        <p style="color:#94a3b8;font-size:13px;margin-top:24px;">
          You can only view candidate profiles that have been explicitly shared with you.
        </p>
      </div>`,
  });
}
