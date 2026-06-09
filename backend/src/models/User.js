/**
 * User model
 *
 * Roles:
 *   admin  — Super-user: all t-1 privileges + can create/modify/delete staff accounts
 *   t-1    — Senior recruiter: full portal access (candidates, jobs, events, scoring, audit)
 *   t-2    — Recruiter: candidates (own only) + jobs view
 *   t-3    — Client: view shared candidate profiles only (email OTP login, no password)
 *
 * Security:
 *   - passwordHash      : select:false — bcrypt cost 12
 *   - totpSecret        : select:false — AES-256-GCM encrypted at rest
 *   - mustChangePassword: true on first login — forces new password before access
 *   - clientOtp         : select:false — cleared after use
 */
import mongoose from 'mongoose';
import crypto   from 'crypto';

// ── AES-256-GCM encryption for TOTP secret ───────────────────────────────────
// Key is derived from TOTP_ENCRYPT_KEY env var (32-byte hex string)
function getEncKey() {
  const hex = process.env.TOTP_ENCRYPT_KEY;
  if (!hex || hex.length < 64) throw new Error('TOTP_ENCRYPT_KEY must be a 64-char hex string');
  return Buffer.from(hex, 'hex');
}

export function encryptTotpSecret(plaintext) {
  const iv         = crypto.randomBytes(12);
  const cipher     = crypto.createCipheriv('aes-256-gcm', getEncKey(), iv);
  const encrypted  = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag    = cipher.getAuthTag();
  // Format: iv(12):authTag(16):ciphertext — all hex
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decryptTotpSecret(stored) {
  const [ivHex, tagHex, cipherHex] = stored.split(':');
  const iv         = Buffer.from(ivHex, 'hex');
  const authTag    = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(cipherHex, 'hex');
  const decipher   = crypto.createDecipheriv('aes-256-gcm', getEncKey(), iv);
  decipher.setAuthTag(authTag);
  return decipher.update(ciphertext) + decipher.final('utf8');
}

// ─────────────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  // admin: super-user (all t-1 powers + user management)
  // t-1:   senior staff (full portal, no user management)
  // t-2:   recruiter (own candidates + jobs view)
  // t-3:   client (shared candidates, email OTP)
  role:         { type: String, enum: ['admin', 't-1', 't-2', 't-3'], required: true },
  avatar:       { type: String, default: '' },
  active:       { type: Boolean, default: true },

  // ── admin / t-1 / t-2 ─────────────────────────────────────────────────────
  passwordHash:        { type: String,  select: false },
  mustChangePassword:  { type: Boolean, default: false }, // true = first login, force new password
  totpSecret:          { type: String,  select: false },   // AES-256-GCM encrypted
  totpEnabled:         { type: Boolean, default: false },
  totpVerifiedAt:      { type: Date,    default: null },

  // Failed TOTP attempt tracking
  totpFailCount:   { type: Number, default: 0,    select: false },
  totpLockedUntil: { type: Date,   default: null, select: false },

  // ── t-3 ───────────────────────────────────────────────────────────────────
  clientOtp:          { type: String,  select: false },
  clientOtpExpiry:    { type: Date,    select: false },
  clientOtpUsed:      { type: Boolean, default: false, select: false },
  clientOtpAttempts:  { type: Number,  default: 0,     select: false },

  // Who granted access (t-3 only)
  grantedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  grantedAt:  { type: Date, default: null },

}, { timestamps: true });

export default mongoose.model('User', userSchema);
