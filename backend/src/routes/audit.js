import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = Router();
router.use(requireAuth, requireAdmin); // audit logs: t-1 only

// GET /api/audit — paginated, newest first
router.get('/', async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip  = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(),
    ]);
    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

export default router;
