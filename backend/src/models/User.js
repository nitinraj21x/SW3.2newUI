/**
 * User model
 *
 * Security:
 *   - passwordHash : select:false — bcrypt, cost 12
 *   - totpSecret   : select:false — AES-256-GCM encrypted at rest
 *   - clientOtp    : select:false — cleared after successful use
 *   - clientOtpAttempts : select:false — locked after 5 wrong attempts
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
  role:         { type: String, enum: ['t-1', 't-2', 't-3'], required: true },
  avatar:       { type: String, default: '' },
  active:       { type: Boolean, default: true },

  // ── t-1 / t-2 ─────────────────────────────────────────────────────────────
  passwordHash:    { type: String,  select: false },
  totpSecret:      { type: String,  select: false },   // AES-256-GCM encrypted
  totpEnabled:     { type: Boolean, default: false },
  totpVerifiedAt:  { type: Date,    default: null },

  // Failed TOTP attempt tracking
  totpFailCount:   { type: Number,  default: 0,   select: false },
  totpLockedUntil: { type: Date,    default: null, select: false },

  // ── t-3 ───────────────────────────────────────────────────────────────────
  clientOtp:          { type: String,  select: false },
  clientOtpExpiry:    { type: Date,    select: false },
  clientOtpUsed:      { type: Boolean, default: false, select: false },
  clientOtpAttempts:  { type: Number,  default: 0,     select: false },

  // Who granted access
  grantedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  grantedAt:  { type: Date, default: null },

}, { timestamps: true });

export default mongoose.model('User', userSchema);
