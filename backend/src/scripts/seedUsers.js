/**
 * seedUsers.js — Seeds the three primary accounts.
 *
 * Account structure:
 *   1 × admin  — Asha (super-user: all t-1 privileges + user management)
 *   2 × t-1    — Senior staff (full portal access, no user management)
 *
 * All accounts:
 *   - Have a temporary password (mustChangePassword = true)
 *   - Will be forced to change password on first login
 *   - TOTP setup happens after password change on first login
 *
 * t-2 accounts are created by the admin via the portal UI (/api/users).
 * t-3 client accounts are created by admin/t-1 via the portal UI (/api/auth/clients).
 *
 * Usage: node src/scripts/seedUsers.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import User     from '../models/User.js';

const SEED = [
  {
    name:     'S1032cAdmin',
    email:    'sewingcircleservice@gmail.com',
    password: 'RDyyt624$$',
    role:     'admin',
    avatar:   'SA',
  },
  {
    name:     'Sc9743AshaKamal',
    email:    'AshaKamal@sewing-circle.org',
    password: 'AJcbr258@!',
    role:     't-1',
    avatar:   'AK',
  },
  {
    name:     'Sc5847VidyaShankar',
    email:    'nitin.raj.25@gmail.com',
    password: 'LAhep385@#',
    role:     't-1',
    avatar:   'VS',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[db] Connected');

  for (const u of SEED) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`[skip] ${u.email} already exists (${existing.role})`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 12);
    await User.create({
      name:               u.name,
      email:              u.email,
      passwordHash,
      role:               u.role,
      avatar:             u.avatar,
      mustChangePassword: false,  // password already set — TOTP setup on first login
      totpEnabled:        false,
    });
    console.log(`[created] ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log('\n[done] Accounts seeded. TOTP setup will be prompted on first login.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
