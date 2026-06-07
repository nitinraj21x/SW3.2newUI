/**
 * server.js — Sewing Circle kS2 Express API
 *
 * Auth model:
 *   t-1/t-2  email + password → TOTP (Microsoft Authenticator)
 *   t-3      email → OTP sent to email
 */
import 'dotenv/config';
import express   from 'express';
import helmet    from 'helmet';
import cors      from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose  from 'mongoose';

import authRoutes      from './routes/auth.js';
import candidateRoutes from './routes/candidates.js';
import jobRoutes       from './routes/jobs.js';
import eventRoutes     from './routes/events.js';
import auditRoutes     from './routes/audit.js';
import userRoutes      from './routes/users.js';

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiters ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}));

// Tighter limit on auth — prevents brute force + OTP flooding
app.use('/api/auth/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 15,
  message: { error: 'Too many auth attempts. Please wait 15 minutes.' },
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/jobs',       jobRoutes);
app.use('/api/events',     eventRoutes);
app.use('/api/audit',      auditRoutes);
app.use('/api/users',      userRoutes);

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[error]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error.' : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('[db] Connected to MongoDB');
    app.listen(PORT, () => console.log(`[server] Running on port ${PORT}`));
  })
  .catch((err) => { console.error('[db] Failed:', err.message); process.exit(1); });
