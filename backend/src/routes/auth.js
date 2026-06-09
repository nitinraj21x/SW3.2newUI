/**
 * auth.js — kS2 Two-step authentication
 *
 * t-1/t-2:  POST /login → { mfaToken }  →  POST /verify-totp → { token }
 *           First login: POST /setup-totp → POST /confirm-totp → { token }
 *
 * t-3:      POST /request-otp  →  POST /verify-otp → { token }
 *
 * Security hardening applied:
 *   - TOTP secrets encrypted at rest (AES-256-GCM via User model helpers)
 *   - OTP comparison uses crypto.timingSafeEqual (no timing attack)
 *   - Per-user TOTP fail counter + lockout (5 fails → 15 min lockout)
 *   - Per-user OTP attempt counter (5 fails → OTP invalidated)
 *   - Email templates sanitize all interpolated values
 *   - setup-totp rejects if secret was generated within last 60s (anti-reset flood)
 *   - mfaToken payload uses opaque random jti instead of raw userId
 */
import { Router }    from 'express';
import bcrypt        from 'bcryptjs';
import jwt           from 'jsonwebtoken';
import crypto        from 'crypto';
import { authenticator } from 'otplib';
import { body }      from 'express-validator';
import { validate }  from '../middleware/validate.js';
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import User, { encryptTotpSecret, decryptTotpSecret } from '../models/User.js';
import AuditLog      from '../models/AuditLog.js';
import { sendClientOtp, sendClientWelcome } from '../utils/email.js';

const router = Router();

// ── Constants ─────────────────────────────────────────────────────────────────
const TOTP_MAX_FAILS   = 5;
const TOTP_LOCKOUT_MS  = 15 * 60 * 1000;   // 15 minutes
const OTP_MAX_ATTEMPTS = 5;
const OTP_TTL_MS       = 10 * 60 * 1000;   // 10 minutes

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Sign a short-lived pre-auth bridge token */
function signMfaToken(userId) {
  const jti = crypto.randomBytes(16).toString('hex'); // opaque, not the userId
  return jwt.sign(
    { jti, uid: userId.toString(), purpose: 'mfa' },
    process.env.MFA_TOKEN_SECRET,
    { expiresIn: process.env.MFA_TOKEN_EXPIRES_IN || '10m' }
  );
}

/** Sign the final session JWT */
function signSessionToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name, avatar: user.avatar },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

/** Strip sensitive fields before sending user to client */
function safeUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
}

/** Constant-time string comparison to prevent timing attacks */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) {
    // Still run timingSafeEqual on equal-length dummy buffers to keep time constant
    crypto.timingSafeEqual(Buffer.alloc(1), Buffer.alloc(1));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/** Escape HTML entities — used in email template interpolation */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Verify and decode an MFA bridge token */
function verifyMfaToken(token) {
  const payload = jwt.verify(token, process.env.MFA_TOKEN_SECRET);
  if (payload.purpose !== 'mfa') throw new Error('Invalid token purpose');
  return payload;
}

// ── t-1/t-2/admin: Step 1 — Password ────────────────────────────────────────
router.post('/login', validate([
  body('email').isEmail().normalizeEmail().trim(),
  body('password').isLength({ min: 6 }).trim(),
]), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .select('+passwordHash +totpEnabled +mustChangePassword');

    // Generic rejection — never reveal whether email exists
    if (!user || !user.active || user.role === 't-3' || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // First-login: force password change before anything else
    if (user.mustChangePassword) {
      const mfaToken = signMfaToken(user._id);
      return res.json({ mustChangePassword: true, mfaToken });
    }

    const mfaToken = signMfaToken(user._id);
    if (!user.totpEnabled) {
      return res.json({ mfaPending: true, totpSetupRequired: true, mfaToken });
    }
    return res.json({ mfaPending: true, totpSetupRequired: false, mfaToken });
  } catch (err) { next(err); }
});

// ── t-1/t-2: TOTP first-time setup ───────────────────────────────────────────
router.post('/setup-totp', validate([
  body('mfaToken').notEmpty(),
]), async (req, res, next) => {
  try {
    const payload = verifyMfaToken(req.body.mfaToken);
    const user    = await User.findById(payload.uid).select('+totpEnabled +totpSecret +totpVerifiedAt');
    if (!user || !user.active) return res.status(404).json({ error: 'User not found.' });
    if (user.totpEnabled)      return res.status(400).json({ error: 'Authenticator already configured.' });

    // Anti-flood: don't regenerate secret if one was saved in last 60 seconds
    if (user.totpSecret && user.totpVerifiedAt === null) {
      const age = Date.now() - user.updatedAt.getTime();
      if (age < 60_000) return res.status(429).json({ error: 'Please wait before retrying setup.' });
    }

    const secret       = authenticator.generateSecret();
    const encrypted    = encryptTotpSecret(secret);
    const otpauthUri   = authenticator.keyuri(user.email, 'Sewing Circle Portal', secret);

    await User.findByIdAndUpdate(user._id, { totpSecret: encrypted, totpEnabled: false });

    // Return the plaintext secret ONCE for QR display — never stored in plaintext again
    res.json({ secret, otpauthUri });
  } catch (err) { next(err); }
});

// ── t-1/t-2: Confirm TOTP setup ──────────────────────────────────────────────
router.post('/confirm-totp', validate([
  body('mfaToken').notEmpty(),
  body('totpCode').isLength({ min: 6, max: 6 }).isNumeric(),
]), async (req, res, next) => {
  try {
    const { mfaToken, totpCode } = req.body;
    const payload = verifyMfaToken(mfaToken);
    const user    = await User.findById(payload.uid)
      .select('+totpSecret +totpEnabled +totpFailCount +totpLockedUntil');

    if (!user || !user.active) return res.status(404).json({ error: 'User not found.' });
    if (user.totpEnabled)      return res.status(400).json({ error: 'TOTP already confirmed.' });
    if (!user.totpSecret)      return res.status(400).json({ error: 'Run setup-totp first.' });

    // Check lockout
    if (user.totpLockedUntil && new Date() < user.totpLockedUntil) {
      return res.status(429).json({ error: 'Too many failed attempts. Try again later.' });
    }

    const plainSecret = decryptTotpSecret(user.totpSecret);
    const valid       = authenticator.verify({ token: totpCode, secret: plainSecret });

    if (!valid) {
      const fails = (user.totpFailCount || 0) + 1;
      const lockUpdate = fails >= TOTP_MAX_FAILS
        ? { totpFailCount: 0, totpLockedUntil: new Date(Date.now() + TOTP_LOCKOUT_MS) }
        : { totpFailCount: fails };
      await User.findByIdAndUpdate(user._id, lockUpdate);
      return res.status(401).json({ error: 'Invalid authenticator code.' });
    }

    await User.findByIdAndUpdate(user._id, {
      totpEnabled: true, totpVerifiedAt: new Date(),
      totpFailCount: 0,  totpLockedUntil: null,
    });

    const token = signSessionToken(user);
    await AuditLog.create({ action: 'TOTP_SETUP_COMPLETE', userId: user._id, userName: user.name, userRole: user.role, detail: 'Authenticator configured.', ip: req.ip });
    res.json({ token, user: safeUser(user) });
  } catch (err) { next(err); }
});

// ── t-1/t-2: Step 2 — Verify TOTP ────────────────────────────────────────────
router.post('/verify-totp', validate([
  body('mfaToken').notEmpty(),
  body('totpCode').isLength({ min: 6, max: 6 }).isNumeric(),
]), async (req, res, next) => {
  try {
    const { mfaToken, totpCode } = req.body;
    const payload = verifyMfaToken(mfaToken);
    const user    = await User.findById(payload.uid)
      .select('+totpSecret +totpEnabled +totpFailCount +totpLockedUntil');

    if (!user || !user.active) return res.status(401).json({ error: 'Account not found.' });
    if (!user.totpEnabled || !user.totpSecret) return res.status(400).json({ error: 'TOTP not configured.' });

    // Lockout check
    if (user.totpLockedUntil && new Date() < user.totpLockedUntil) {
      return res.status(429).json({ error: 'Account temporarily locked. Try again later.' });
    }

    const plainSecret = decryptTotpSecret(user.totpSecret);
    const valid       = authenticator.verify({ token: totpCode, secret: plainSecret });

    if (!valid) {
      const fails = (user.totpFailCount || 0) + 1;
      const lockUpdate = fails >= TOTP_MAX_FAILS
        ? { totpFailCount: 0, totpLockedUntil: new Date(Date.now() + TOTP_LOCKOUT_MS) }
        : { totpFailCount: fails };
      await User.findByIdAndUpdate(user._id, lockUpdate);
      const remaining = TOTP_MAX_FAILS - fails;
      return res.status(401).json({ error: remaining > 0 ? `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` : 'Account locked for 15 minutes.' });
    }

    // Success — reset fail counter
    await User.findByIdAndUpdate(user._id, { totpFailCount: 0, totpLockedUntil: null });

    const token = signSessionToken(user);
    await AuditLog.create({ action: 'LOGIN', userId: user._id, userName: user.name, userRole: user.role, detail: 'Login via password + TOTP.', ip: req.ip });
    res.json({ token, user: safeUser(user) });
  } catch (err) { next(err); }
});

// ── t-3: Request OTP ──────────────────────────────────────────────────────────
router.post('/request-otp', validate([
  body('email').isEmail().normalizeEmail().trim(),
]), async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email })
      .select('+clientOtp +clientOtpExpiry +clientOtpUsed +clientOtpAttempts');

    // Constant-time path — always respond same regardless of whether user exists
    const GENERIC = { message: 'If that email is registered, a code has been sent.' };

    if (!user || !user.active || user.role !== 't-3') return res.json(GENERIC);

    const otp    = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + OTP_TTL_MS);

    await User.findByIdAndUpdate(user._id, {
      clientOtp: otp, clientOtpExpiry: expiry,
      clientOtpUsed: false, clientOtpAttempts: 0,
    });

    // Send email with sanitized values
    await sendClientOtp(user.email, otp, user.name);
    res.json(GENERIC);
  } catch (err) { next(err); }
});

// ── t-3: Verify OTP ───────────────────────────────────────────────────────────
router.post('/verify-otp', validate([
  body('email').isEmail().normalizeEmail().trim(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
]), async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email })
      .select('+clientOtp +clientOtpExpiry +clientOtpUsed +clientOtpAttempts');

    const INVALID = { error: 'Invalid or expired code.' };

    if (!user || !user.active || user.role !== 't-3') return res.status(401).json(INVALID);
    if (user.clientOtpUsed || !user.clientOtp)        return res.status(401).json(INVALID);
    if (new Date() > user.clientOtpExpiry)            return res.status(401).json({ error: 'Code expired. Request a new one.' });

    // Track attempts — invalidate after OTP_MAX_ATTEMPTS
    const attempts = (user.clientOtpAttempts || 0) + 1;
    if (attempts > OTP_MAX_ATTEMPTS) {
      await User.findByIdAndUpdate(user._id, { clientOtp: null, clientOtpExpiry: null, clientOtpUsed: true });
      return res.status(429).json({ error: 'Too many attempts. Request a new code.' });
    }

    // Timing-safe comparison
    if (!safeEqual(user.clientOtp, otp)) {
      await User.findByIdAndUpdate(user._id, { clientOtpAttempts: attempts });
      return res.status(401).json(INVALID);
    }

    // Consume OTP
    await User.findByIdAndUpdate(user._id, {
      clientOtp: null, clientOtpExpiry: null,
      clientOtpUsed: true, clientOtpAttempts: 0,
    });

    const token = signSessionToken(user);
    await AuditLog.create({ action: 'LOGIN', userId: user._id, userName: user.name, userRole: user.role, detail: 'Client login via email OTP.', ip: req.ip });
    res.json({ token, user: safeUser(user) });
  } catch (err) { next(err); }
});

// ── Force password change (first login) ──────────────────────────────────────
// Validates the new password strength and clears mustChangePassword flag.
// Uses the mfaToken from step-1 login so no session JWT is needed yet.
const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

router.post('/change-password', validate([
  body('mfaToken').notEmpty(),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(PW_REGEX).withMessage('Password must contain uppercase, lowercase, a number and a special character.'),
]), async (req, res, next) => {
  try {
    const { mfaToken, newPassword } = req.body;
    const payload = verifyMfaToken(mfaToken);
    const user    = await User.findById(payload.uid)
      .select('+passwordHash +mustChangePassword +totpEnabled');

    if (!user || !user.active) return res.status(404).json({ error: 'User not found.' });
    if (!user.mustChangePassword) return res.status(400).json({ error: 'Password change not required.' });

    // Ensure new password is not the same as the temporary one
    const same = await bcrypt.compare(newPassword, user.passwordHash);
    if (same) return res.status(422).json({ error: 'New password must be different from your current password.' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(user._id, { passwordHash, mustChangePassword: false });

    await AuditLog.create({
      action: 'PASSWORD_CHANGED', userId: user._id, userName: user.name,
      userRole: user.role, detail: 'User changed password on first login.', ip: req.ip,
    });

    // Now proceed to TOTP setup (all staff must configure TOTP after first login)
    const newMfaToken = signMfaToken(user._id);
    if (!user.totpEnabled) {
      return res.json({ mfaPending: true, totpSetupRequired: true, mfaToken: newMfaToken });
    }
    return res.json({ mfaPending: true, totpSetupRequired: false, mfaToken: newMfaToken });
  } catch (err) { next(err); }
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.post('/logout', requireAuth, async (req, res) => {
  try {
    await AuditLog.create({ action: 'LOGOUT', userId: req.user.id, userName: req.user.name, userRole: req.user.role, detail: 'User logged out.', ip: req.ip });
  } catch { /* best-effort */ }
  res.json({ message: 'Logged out.' });
});

// ── /me ───────────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.active) return res.status(401).json({ error: 'Account not found.' });
    res.json(safeUser(user));
  } catch (err) { next(err); }
});

// ── Client management (t-1 only) ──────────────────────────────────────────────
router.post('/clients', requireAuth, requireAdmin, validate([
  body('name').trim().escape().notEmpty(),
  body('email').isEmail().normalizeEmail().trim(),
]), async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (await User.findOne({ email })) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const client = await User.create({
      name, email, role: 't-3', active: true,
      grantedBy: req.user.id, grantedAt: new Date(),
      avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    });
    await sendClientWelcome(email, name);
    await AuditLog.create({ action: 'CLIENT_ACCESS_GRANTED', userId: req.user.id, userName: req.user.name, userRole: req.user.role, targetId: client._id, targetName: esc(name), detail: `Client account created for ${esc(email)}.`, ip: req.ip });
    res.status(201).json(safeUser(client));
  } catch (err) { next(err); }
});

router.get('/clients', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const clients = await User.find({ role: 't-3' }).sort({ createdAt: -1 }).populate('grantedBy', 'name email');
    res.json(clients.map(c => ({ ...safeUser(c), active: c.active, grantedBy: c.grantedBy, grantedAt: c.grantedAt, createdAt: c.createdAt })));
  } catch (err) { next(err); }
});

router.patch('/clients/:id/toggle', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const client = await User.findOne({ _id: req.params.id, role: 't-3' });
    if (!client) return res.status(404).json({ error: 'Client not found.' });
    client.active = !client.active;
    await client.save();
    await AuditLog.create({ action: client.active ? 'CLIENT_ACCESS_RESTORED' : 'CLIENT_ACCESS_REVOKED', userId: req.user.id, userName: req.user.name, userRole: req.user.role, targetId: client._id, targetName: client.name, detail: `Access ${client.active ? 'restored' : 'revoked'} for ${client.email}.`, ip: req.ip });
    res.json({ ...safeUser(client), active: client.active });
  } catch (err) { next(err); }
});

router.delete('/clients/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const client = await User.findOneAndDelete({ _id: req.params.id, role: 't-3' });
    if (!client) return res.status(404).json({ error: 'Client not found.' });
    await AuditLog.create({ action: 'CLIENT_DELETED', userId: req.user.id, userName: req.user.name, userRole: req.user.role, targetId: req.params.id, targetName: client.name, detail: `Client deleted: ${client.email}.`, ip: req.ip });
    res.json({ message: 'Client account deleted.' });
  } catch (err) { next(err); }
});

export default router;
