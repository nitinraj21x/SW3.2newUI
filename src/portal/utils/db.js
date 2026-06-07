/**
 * Local JSON persistence layer.
 *
 * Mirrors the MongoDB document shape so the switch to a real backend
 * is a straight swap of these functions for API calls.
 *
 * MongoDB collection: "candidates"
 * MongoDB collection: "auditLogs"
 *
 * Storage: localStorage (keyed by collection name) so data survives
 * page refreshes without a backend.  The db.json file in /src/data/
 * serves as the schema reference and seed — it is NOT written at runtime
 * (browsers can't write to the filesystem).  Runtime data lives in
 * localStorage under the same keys.
 */

const KEYS = {
  candidates: 'cp_candidates',
  auditLogs:  'cp_auditLogs',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function read(collection) {
  try {
    const raw = localStorage.getItem(KEYS[collection]);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(collection, docs) {
  try {
    localStorage.setItem(KEYS[collection], JSON.stringify(docs));
    // Keep meta.lastUpdated in sync
    const meta = JSON.parse(localStorage.getItem('cp_meta') || '{}');
    meta.lastUpdated = new Date().toISOString();
    localStorage.setItem('cp_meta', JSON.stringify(meta));
  } catch (e) {
    console.error('[db] write failed:', e);
  }
}

// ── MongoDB-shaped document builder ───────────────────────────────────────────
// Mirrors: { _id, createdAt, updatedAt, ...fields }

export function toMongoDoc(data) {
  const now = new Date().toISOString();
  return {
    _id:       data.id || data._id,   // keep existing id as _id
    ...data,
    createdAt: data.createdAt || now,
    updatedAt: now,
  };
}

// ── Candidates collection ──────────────────────────────────────────────────────

export const candidatesDb = {
  /** Load all documents. Falls back to seed data on first run. */
  findAll(seedData = []) {
    const stored = read('candidates');
    if (stored !== null) return stored;
    // First run — seed from mockData and persist
    const seeded = seedData.map(toMongoDoc);
    write('candidates', seeded);
    return seeded;
  },

  /** Insert one document */
  insertOne(doc) {
    const all = read('candidates') || [];
    const mongoDoc = toMongoDoc(doc);
    all.unshift(mongoDoc);          // newest first, like MongoDB default sort
    write('candidates', all);
    return mongoDoc;
  },

  /** Replace one document by _id */
  replaceOne(id, updates) {
    const all = read('candidates') || [];
    const idx = all.findIndex((d) => d._id === id || d.id === id);
    if (idx === -1) return null;
    const updated = toMongoDoc({ ...all[idx], ...updates, _id: all[idx]._id || all[idx].id });
    all[idx] = updated;
    write('candidates', all);
    return updated;
  },

  /** Delete one document by _id */
  deleteOne(id) {
    const all = read('candidates') || [];
    const filtered = all.filter((d) => d._id !== id && d.id !== id);
    write('candidates', filtered);
    return all.length !== filtered.length;
  },

  /** Overwrite entire collection (used for bulk sync from Zustand) */
  replaceAll(docs) {
    const mongoDocs = docs.map(toMongoDoc);
    write('candidates', mongoDocs);
    return mongoDocs;
  },
};

// ── AuditLogs collection ───────────────────────────────────────────────────────

export const auditLogsDb = {
  findAll(seedData = []) {
    const stored = read('auditLogs');
    if (stored !== null) return stored;
    const seeded = seedData.map(toMongoDoc);
    write('auditLogs', seeded);
    return seeded;
  },

  insertOne(doc) {
    const all = read('auditLogs') || [];
    const mongoDoc = toMongoDoc(doc);
    all.unshift(mongoDoc);
    write('auditLogs', all);
    return mongoDoc;
  },

  replaceAll(docs) {
    const mongoDocs = docs.map(toMongoDoc);
    write('auditLogs', mongoDocs);
    return mongoDocs;
  },
};

// ── Dev utility: export current DB as a JSON download ─────────────────────────
export function exportDbAsJson() {
  const payload = {
    candidates: read('candidates') || [],
    auditLogs:  read('auditLogs')  || [],
    meta: {
      version:     '1.0.0',
      exportedAt:  new Date().toISOString(),
      description: 'CandidatePortal export — ready for MongoDB import via mongoimport',
    },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `candidateportal_db_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
