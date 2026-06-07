/**
 * seedUsers.js — Creates initial t-1 and t-2 staff accounts.
 * Run once: node src/scripts/seedUsers.js
 *
 * t-3 client accounts are created by t-1 via the portal UI (POST /api/auth/clients).
 * TOTP setup is completed on first login — this script does NOT set totpSecret.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';
import User     from '../models/User.js';

const SEED_STAFF = [
  { name: 'Alice Admin',     email: 'alice@sewingcircle.io', password: 'Admin@2025!',   role: 't-1', avatar: 'AA' },
  { name: 'Bob Recruiter',   email: 'bob@sewingcircle.io',   password: 'Recruit@2025!', role: 't-2', avatar: 'BR' },
  { name: 'Carol Recruiter', email: 'carol@sewingcircle.io', password: 'Recruit@2025!', role: 't-2', avatar: 'CR' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[db] Connected');

  for (const u of SEED_STAFF) {
    const exists = await User.findOne({ email: u.email });
    if (exists) { console.log(`[skip] ${u.email} already exists`); continue; }
    const passwordHash = await bcrypt.hash(u.password, 12);
    await User.create({
      name: u.name, email: u.email, passwordHash,
      role: u.role, avatar: u.avatar,
      totpEnabled: false,  // TOTP setup required on first login
    });
    console.log(`[created] ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log('[done] Staff accounts seeded. TOTP setup will be prompted on first login.');
  console.log('[note] t-3 client accounts are created by admins via the portal.');
}

seed().catch((err) => { console.error(err); process.exit(1); });
