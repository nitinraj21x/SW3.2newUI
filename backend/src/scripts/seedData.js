/**
 * seedData.js — Seeds candidates, jobs and events from mongodb/ JSON files.
 * Run after seedUsers.js: node src/scripts/seedData.js
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join }  from 'path';
import mongoose  from 'mongoose';
import User      from '../models/User.js';
import Candidate from '../models/Candidate.js';
import Job       from '../models/Job.js';
import Event     from '../models/Event.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir   = join(__dirname, '../../../mongodb');

function load(file) {
  return JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[db] Connected');

  // Resolve user references
  const alice = await User.findOne({ email: 'alice@sewingcircle.io' });
  const bob   = await User.findOne({ email: 'bob@sewingcircle.io' });
  const carol = await User.findOne({ email: 'carol@sewingcircle.io' });

  if (!alice || !bob || !carol) {
    console.error('[error] Run seedUsers.js first.');
    process.exit(1);
  }

  const userMap = { u1: alice._id, u2: bob._id, u3: carol._id };

  // ── Candidates ──────────────────────────────────────────────────────────────
  const candidatesRaw = load('candidates.json');
  let cCount = 0;
  for (const c of candidatesRaw) {
    const exists = await Candidate.findOne({ email: c.email });
    if (exists) { console.log(`[skip] candidate ${c.email}`); continue; }

    const { _id, addedBy, sharedWith, ...rest } = c;
    await Candidate.create({
      ...rest,
      addedBy:    userMap[addedBy] || alice._id,
      sharedWith: [],   // t-3 clients do not exist yet — share after creating them
    });
    cCount++;
  }
  console.log(`[candidates] ${cCount} created`);

  // ── Jobs ────────────────────────────────────────────────────────────────────
  const jobsRaw = load('jobs.json');
  let jCount = 0;
  for (const j of jobsRaw) {
    const exists = await Job.findOne({ title: j.title, client: j.client });
    if (exists) { console.log(`[skip] job ${j.title}`); continue; }
    const { _id, createdBy, ...rest } = j;
    await Job.create({ ...rest, createdBy: alice._id });
    jCount++;
  }
  console.log(`[jobs] ${jCount} created`);

  // ── Events ──────────────────────────────────────────────────────────────────
  const eventsRaw = load('events.json');
  let eCount = 0;
  for (const e of eventsRaw) {
    const exists = await Event.findOne({ title: e.title });
    if (exists) { console.log(`[skip] event ${e.title}`); continue; }
    const { _id, createdBy, ...rest } = e;
    await Event.create({ ...rest, createdBy: alice._id });
    eCount++;
  }
  console.log(`[events] ${eCount} created`);

  await mongoose.disconnect();
  console.log('[done]');
}

seed().catch((err) => { console.error(err); process.exit(1); });
