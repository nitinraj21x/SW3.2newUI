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
    name:   'Asha Admin',
    email:  'asha@sewingcircle.io',
    // Temporary password — MUST be changed on first login
    password: 'TempAdmin@2025!',
    role:   'admin',
    avatar: 'AA',
  },
  {
    name:   'Senior Staff One',
    email:  'staff1@sewingcircle.io',
    password: 'TempStaff@2025!',
    role:   't-1',
    avatar: 'S1',
  },
  {
    name:   'Senior Staff Two',
    email:  'staff2@sewingcircle.io',
    password: 'TempStaff@2025!',
    role:   't-1',
    avatar: 'S2',
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
      mustChangePassword: true,   // force password change on first login
      totpEnabled:        false,  // TOTP set up after first-login password change
    });
    console.log(`[created] ${u.email} (${u.role}) — temp password: ${u.password}`);
  }

  await mongoose.disconnect();
  console.log('');
  console.log('[done]');
  console.log('All accounts require a password change on first login.');
  console.log('Share temp passwords securely. They cannot be recovered after first use.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
