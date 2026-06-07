# Sewing Circle kS1 — Technical Architecture & Security Report

**Project:** kS1 Integrated Platform  
**Version:** 1.0.0  
**Date:** May 2026  
**Prepared by:** Engineering Team

---

## 1. Executive Summary

The kS1 platform is a unified web application combining two distinct products under a single deployment:

- **Public Website** (`/`) — The Sewing Circle community-facing site: hero, about, events, community, and contact sections.
- **Staff Portal** (`/portal`) — An internal employee tool for IT recruitment management, featuring candidate tracking, job orders, scoring, event management, and compliance audit logging.

This report documents the full technology stack, the rationale behind each choice, the security architecture, and the decision to use **PostgreSQL with JSONB** as the primary data store.

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Render (Static Site)                  │
│                                                          │
│   /          → Public Website (React SPA)               │
│   /portal/*  → Staff Portal (React SPA, lazy-loaded)    │
│                                                          │
│   Built by Vite → single dist/ folder                   │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS API calls
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Render (Web Service)                    │
│                  Node.js + Express API                   │
│                                                          │
│   helmet · cors · rate-limit · express-validator         │
│   JWT authentication · server-side RBAC                 │
└──────────────────────────┬──────────────────────────────┘
                           │ SSL connection
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Render PostgreSQL (Managed)                 │
│                                                          │
│   Structured tables: users, audit_logs                  │
│   JSONB columns: candidates, jobs, events               │
│   Row-Level Security (RLS) policies                     │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Role |
|---|---|---|
| **React** | 19 | UI component framework |
| **Vite** | 8 | Build tool and dev server |
| **React Router DOM** | 7 | Client-side routing (`/` vs `/portal`) |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Zustand** | 5 | Lightweight global state management |
| **date-fns** | 4 | Date formatting and manipulation |
| **lucide-react** | 1.x | Icon library |
| **pdfjs-dist** | 5 | Client-side PDF text extraction for resume parsing |
| **uuid** | 14 | Client-side ID generation (pre-backend) |
| **@emailjs/browser** | 4 | Contact form email delivery (no backend required) |

#### Why React + Vite?
React is the dominant UI library for component-based SPAs with a mature ecosystem. Vite v8 uses Rolldown (Rust-based bundler) for sub-second builds and native ES module dev serving — significantly faster than Webpack or older Vite versions. The combination produces a production build in under 1 second for this project.

#### Why Zustand over Redux?
Redux adds significant boilerplate for a project of this scale. Zustand provides the same predictable state model with a fraction of the code, no providers required, and direct store access outside React components — useful for the `PERMISSIONS` matrix which is called from both components and the store itself.

#### Why React Router DOM v7?
v7 introduces the `Routes`/`Route` API used here to split the public site and portal into separate lazy-loaded chunks. The portal (`PortalApp`) is only downloaded when a user navigates to `/portal`, keeping the public site bundle lean.

#### Why Tailwind CSS v4?
Tailwind v4 uses a Vite plugin (`@tailwindcss/vite`) instead of PostCSS, eliminating a build step. The utility-first approach is well-suited to a dense information UI like the candidate portal. CSS variables are used for the theme system so dark/light mode works without JavaScript class toggling on every element.

---

### 3.2 Backend

| Technology | Version | Role |
|---|---|---|
| **Node.js** | 20 LTS | Runtime |
| **Express** | 4 | HTTP framework |
| **helmet** | 7 | Secure HTTP headers |
| **cors** | 2 | Cross-origin request control |
| **express-rate-limit** | 7 | Brute-force protection |
| **express-validator** | 7 | Input sanitization and validation |
| **bcryptjs** | 2 | Password hashing |
| **jsonwebtoken** | 9 | Stateless JWT authentication |
| **pg** (node-postgres) | 8 | PostgreSQL client |

#### Why Node.js + Express?
The frontend is already JavaScript/React. Using Node.js on the backend means one language across the full stack, shared validation logic, and a single developer context. Express is minimal and well-understood — it does not impose an architecture, which is appropriate for a project that will grow incrementally.

#### Why not NestJS or Fastify?
NestJS adds significant complexity (decorators, modules, DI container) that is not justified for an internal tool with a small team. Fastify is faster than Express but the performance difference is irrelevant at this traffic level. Express has the largest ecosystem and the most documentation.

---

### 3.3 Database — PostgreSQL with JSONB

#### The Decision

The original design used MongoDB (document store). After review, **PostgreSQL with JSONB columns** was chosen instead. Here is the reasoning:

#### Why PostgreSQL over MongoDB?

| Concern | MongoDB | PostgreSQL + JSONB |
|---|---|---|
| **ACID transactions** | Multi-document transactions added in v4, complex | Native, battle-tested since 1996 |
| **Data integrity** | Schema-less — easy to store malformed data | Constraints, foreign keys, NOT NULL enforced at DB level |
| **Audit log queries** | Aggregation pipeline required | Standard SQL — `WHERE`, `JOIN`, `GROUP BY` |
| **RBAC enforcement** | Application-level only | Row-Level Security (RLS) policies at DB level |
| **Render hosting** | Requires Atlas (external) | Render Managed PostgreSQL — same platform, same billing |
| **Backup & PITR** | Atlas paid feature | Render PostgreSQL includes daily backups + PITR |
| **Cost** | Atlas M0 free → M10 $57/mo | Render PostgreSQL free → $7/mo starter |
| **Compliance** | No built-in audit trail | `pg_audit` extension available |

#### Why JSONB for flexible fields?

Candidates, jobs, and events have variable-length arrays (skills, work history, images, education). Normalising these into separate tables would require 5–8 joins per query. JSONB gives the flexibility of a document store while keeping the ACID guarantees and query power of PostgreSQL.

```sql
-- Example: find all candidates with React skill
SELECT id, first_name, last_name
FROM candidates
WHERE data->'skills' @> '["React"]';

-- GIN index makes this fast
CREATE INDEX idx_candidates_skills ON candidates USING GIN ((data->'skills'));
```

#### Schema Design

```sql
-- Structured tables for entities that need relational integrity
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role         TEXT NOT NULL CHECK (role IN ('t-1','t-2','t-3')),
  avatar       TEXT DEFAULT '',
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- JSONB for flexible document-like data
CREATE TABLE candidates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  added_by   UUID REFERENCES users(id),
  data       JSONB NOT NULL,           -- all candidate fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id),
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id),
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Append-only audit log — fully structured for fast queries
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action      TEXT NOT NULL,
  user_id     UUID REFERENCES users(id),
  user_name   TEXT,
  target_id   TEXT,
  target_name TEXT,
  detail      TEXT,
  timestamp   TIMESTAMPTZ DEFAULT NOW()
);

-- GIN indexes for JSONB queries
CREATE INDEX idx_candidates_skills   ON candidates USING GIN ((data->'skills'));
CREATE INDEX idx_candidates_status   ON candidates ((data->>'status'));
CREATE INDEX idx_candidates_shared   ON candidates USING GIN ((data->'sharedWith'));
CREATE INDEX idx_events_type         ON events ((data->>'type'));
CREATE INDEX idx_audit_timestamp     ON audit_logs (timestamp DESC);
```

#### Row-Level Security (RLS)

PostgreSQL RLS enforces data access at the database level — even if the application has a bug, the database will not return rows the user is not allowed to see.

```sql
-- Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- t-1 sees everything
CREATE POLICY admin_all ON candidates
  FOR ALL TO app_user
  USING (current_setting('app.user_role') = 't-1');

-- t-2 sees all candidates
CREATE POLICY recruiter_read ON candidates
  FOR SELECT TO app_user
  USING (current_setting('app.user_role') = 't-2');

-- t-3 sees only shared candidates
CREATE POLICY client_shared ON candidates
  FOR SELECT TO app_user
  USING (
    current_setting('app.user_role') = 't-3'
    AND data->'sharedWith' @> to_jsonb(current_setting('app.user_id')::text)
  );
```

---

### 3.4 Deployment — Render

| Service | Render Product | Cost |
|---|---|---|
| Frontend (kS1 dist/) | Static Site | Free |
| Backend (Express API) | Web Service | Free (750 hrs/mo) |
| Database | PostgreSQL | Free (90 days) → $7/mo |

#### Why Render over Netlify + Railway?
Render hosts all three services (static site, API, database) under one platform with unified billing, a single dashboard, and automatic SSL for all services. Netlify is frontend-only; Railway requires a separate account. Render's managed PostgreSQL includes automatic daily backups and point-in-time recovery — critical for candidate data.

#### Why not Vercel?
Vercel's free tier does not include a managed database. It also enforces serverless functions with a 10-second timeout, which is incompatible with long-running PDF parsing operations.

---

## 4. Security Architecture

### 4.1 Authentication

- **Mechanism:** JSON Web Tokens (JWT), signed with HS256 using a 64-byte random secret
- **Storage:** `sessionStorage` on the client (cleared on tab close) — not `localStorage` (persists indefinitely, higher XSS risk)
- **Expiry:** 8 hours — forces re-login after a working day
- **Password hashing:** bcrypt with cost factor 12 (~250ms per hash — slow enough to resist brute force)
- **Production upgrade path:** Replace `sessionStorage` with an `httpOnly` cookie containing the JWT — this prevents JavaScript from reading the token entirely, eliminating XSS token theft

### 4.2 Authorisation (RBAC)

RBAC is enforced at **three layers**:

| Layer | Where | What it does |
|---|---|---|
| **UI layer** | React `PERMISSIONS` object | Hides tabs, buttons, and actions the user cannot access |
| **API layer** | Express `requireAuth` + `requireRole` middleware | Rejects requests with wrong role before they reach the database |
| **Database layer** | PostgreSQL Row-Level Security | Prevents data leakage even if the API has a bug |

The three tiers:

| Tier | Role | Permissions |
|---|---|---|
| **t-1** | Admin | Full access to all tabs, all CRUD, events management, audit logs |
| **t-2** | Recruiter | Candidates (add/edit own) + Jobs (view only). No events, scoring, or audit access |
| **t-3** | Client | View only — candidates explicitly shared with their account |

### 4.3 HTTP Security Headers (helmet)

`helmet` sets the following headers on every API response:

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | Strict | Prevents XSS by whitelisting script sources |
| `X-Frame-Options` | DENY | Prevents clickjacking |
| `X-Content-Type-Options` | nosniff | Prevents MIME-type sniffing |
| `Strict-Transport-Security` | max-age=31536000 | Forces HTTPS for 1 year |
| `Referrer-Policy` | no-referrer | Prevents URL leakage in referrer headers |
| `Permissions-Policy` | Restrictive | Disables camera, microphone, geolocation APIs |

### 4.4 Rate Limiting

Two tiers of rate limiting via `express-rate-limit`:

| Endpoint group | Limit | Window | Purpose |
|---|---|---|---|
| All `/api/*` routes | 100 requests | 15 minutes | General abuse prevention |
| `/api/auth/*` routes | 10 requests | 15 minutes | Brute-force login protection |

### 4.5 Input Sanitization

Every write endpoint uses `express-validator` rules:
- `.trim()` — removes leading/trailing whitespace
- `.escape()` — converts `<`, `>`, `&`, `"`, `'` to HTML entities
- `.isEmail()` + `.normalizeEmail()` — validates and normalises email addresses
- `.isIn([...])` — whitelists enum values (status, role, type)
- `.isInt({ min, max })` — bounds-checks numeric fields

Parameterised queries via `node-postgres` (`pg`) prevent SQL injection — user input is never interpolated into query strings.

### 4.6 CORS

The API only accepts requests from the exact frontend origin:

```js
cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true })
```

`FRONTEND_ORIGIN` is set in Render's environment variables — never hardcoded.

### 4.7 Image Protection

Event photos are protected at two levels:

1. **Watermark** — The Sewing Circle logo is composited onto the bottom-right of every uploaded image using the Canvas API before storage. The watermark is baked into the pixel data and cannot be removed without image editing software.

2. **ProtectedImage component** — A transparent `div` overlay sits above every `<img>` element on both the public site and the portal. This overlay:
   - Intercepts right-click → prevents "Save image as"
   - Intercepts `dragstart` → prevents drag-to-desktop
   - Shows a `© Sewing Circle` label on hover

This is a UX deterrent, not cryptographic protection. For stronger protection in production, images should be served via signed, time-limited URLs from Cloudinary or S3.

### 4.8 Environment Variables

No secrets are stored in code. All sensitive values are stored in Render's environment variable panel:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Render injects automatically) |
| `JWT_SECRET` | 64-byte random hex string |
| `JWT_EXPIRES_IN` | Token lifetime (default: `8h`) |
| `FRONTEND_ORIGIN` | Exact frontend URL for CORS |
| `PORT` | Server port (Render injects automatically) |

---

## 5. Data Flow

### 5.1 Candidate Lifecycle

```
Recruiter (t-2)
  │
  ├── Uploads resume (PDF)
  │     └── pdfjs-dist extracts text in browser
  │           └── Watermark applied to any photos
  │                 └── Form pre-filled with parsed data
  │
  ├── Submits form → POST /api/candidates
  │     └── express-validator sanitizes all fields
  │           └── requireRecruiter middleware checks JWT role
  │                 └── INSERT INTO candidates (added_by, data) VALUES (...)
  │
  └── Shares with client → PATCH /api/candidates/:id/share
        └── Updates data->'sharedWith' array in JSONB
              └── t-3 client can now see the candidate via RLS policy
```

### 5.2 Event Lifecycle

```
Admin (t-1) — Portal Events Tab
  │
  ├── Uploads event photo
  │     └── Canvas API applies watermark (logo, bottom-right, 35% opacity)
  │           └── Base64 data URL stored in form state
  │
  ├── Saves event → POST /api/events
  │     └── requireAdmin middleware
  │           └── INSERT INTO events (created_by, data) VALUES (...)
  │
  └── Public site reads events → GET /api/events (no auth required)
        └── EventsSection.jsx renders with ProtectedImage overlay
```

---

## 6. Migration from MongoDB Seed Files

The `mongodb/` folder contains JSON seed files that were prepared for MongoDB. These map directly to the PostgreSQL schema:

| MongoDB collection | PostgreSQL table | Migration |
|---|---|---|
| `users.json` | `users` | Direct insert — add `password_hash` via `seedUsers.js` |
| `candidates.json` | `candidates` | Wrap each document in `{ added_by, data: {...} }` |
| `jobs.json` | `jobs` | Wrap each document in `{ created_by, data: {...} }` |
| `events.json` | `events` | Wrap each document in `{ created_by, data: {...} }` |

Migration script pattern:
```js
// candidates
for (const c of candidatesJson) {
  await pool.query(
    'INSERT INTO candidates (id, added_by, data) VALUES ($1, $2, $3)',
    [c._id, c.addedBy, JSON.stringify(c)]
  );
}
```

---

## 7. Deployment Checklist

### Before going live

- [ ] Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Set all environment variables in Render dashboard
- [ ] Run `node src/scripts/seedUsers.js` to create initial users
- [ ] Run database migration script to seed PostgreSQL from JSON files
- [ ] Enable PostgreSQL RLS policies
- [ ] Verify CORS origin matches deployed frontend URL exactly
- [ ] Test login with each tier (t-1, t-2, t-3) and confirm tab visibility
- [ ] Confirm right-click is blocked on event images
- [ ] Confirm watermark appears on newly uploaded images

### Render deployment

```bash
# Frontend (Static Site)
Build command:  npm run build
Publish dir:    dist

# Backend (Web Service)
Build command:  npm install
Start command:  node src/server.js
Environment:    NODE_ENV=production + all env vars above
```

---

## 8. Future Roadmap

| Priority | Feature | Notes |
|---|---|---|
| High | Replace `sessionStorage` JWT with `httpOnly` cookie | Eliminates XSS token theft vector |
| High | Cloudinary integration for image storage | Replace base64 localStorage with CDN URLs |
| High | Signed image URLs | Time-limited URLs prevent direct hotlinking |
| Medium | `pg_audit` extension | Database-level audit trail independent of application |
| Medium | Email verification on signup | Prevent account creation with fake emails |
| Medium | 2FA for t-1 accounts | Admin accounts are highest-value targets |
| Low | Redis session store | For horizontal scaling across multiple API instances |
| Low | Full-text search on candidates | PostgreSQL `tsvector` on JSONB fields |

---

## 9. Summary

The kS1 platform uses a deliberately lean stack chosen for:

- **Simplicity** — one language (JavaScript/TypeScript) across frontend and backend
- **Cost** — all services run on free or near-free tiers during development
- **Security** — defence in depth: UI guards + API middleware + database RLS
- **Flexibility** — PostgreSQL JSONB gives document-store flexibility without sacrificing ACID guarantees, relational integrity, or SQL query power
- **Deployability** — Render hosts frontend, backend, and database on one platform with automatic SSL, daily backups, and zero infrastructure management

The switch from MongoDB to PostgreSQL + JSONB is the most significant architectural decision. It trades the marginal convenience of a schema-less document store for significantly stronger data integrity, native ACID transactions, row-level security, and a lower total cost of ownership on Render's managed PostgreSQL service.
