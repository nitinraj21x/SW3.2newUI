/**
 * email.js — Resend SDK email delivery
 *
 * Resend is a developer-first email API.
 * Set RESEND_API_KEY in Render environment variables.
 * Get a free API key at https://resend.com
 *
 * Free tier: 3,000 emails/month, 100/day — more than enough for OTP delivery.
 *
 * To use a custom sender domain (e.g. noreply@sewingcircle.io):
 *   1. Add your domain in the Resend dashboard
 *   2. Add the DNS records they provide
 *   3. Set EMAIL_FROM=noreply@sewingcircle.io in Render env vars
 *
 * Without a custom domain, use the Resend test address:
 *   EMAIL_FROM=onboarding@resend.dev  (only delivers to your verified email)
 */
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/** Escape HTML entities — prevents injection in email templates */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const FROM = () => process.env.EMAIL_FROM || 'onboarding@resend.dev';
const PORTAL_URL = () => process.env.FRONTEND_ORIGIN || process.env.FRONTEND_URL || '';

/** Send a 6-digit OTP to a t-3 client (valid 10 minutes) */
export async function sendClientOtp(toEmail, otp, clientName) {
  await resend.emails.send({
    from:    FROM(),
    to:      [toEmail],
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
  await resend.emails.send({
    from:    FROM(),
    to:      [toEmail],
    subject: 'You have been granted access to the Sewing Circle Portal',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff;">
        <h2 style="color:#0f172a;margin:0 0 8px;">Welcome, ${esc(clientName) || 'there'}</h2>
        <p style="color:#475569;margin:0 0 16px;">
          You have been granted access to the Sewing Circle candidate portal.<br/>
          To sign in, visit the portal and enter your email address —
          a one-time code will be sent to your inbox.
        </p>
        <a href="${PORTAL_URL()}/portal"
           style="display:inline-block;background:#06b6d4;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
          Go to Portal
        </a>
        <p style="color:#94a3b8;font-size:13px;margin-top:24px;">
          You can only view candidate profiles that have been explicitly shared with you.
        </p>
      </div>`,
  });
}
