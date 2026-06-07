/**
 * users.js — /api/users
 * t-1 only: manage internal staff accounts (t-1, t-2)
 * t-3 clients are managed via /api/auth/clients
 */
import { Router } from 'express';
import { body }   from 'express-validator';
import bcrypt     from 'bcryptjs';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import User     from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const router = Router();
router.use(requireAuth, requireAdmin);

// GET /api/users — list all internal staff (t-1, t-2)
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({ role: { $in: ['t-1', 't-2'] } })
      .select('-passwordHash -totpSecret -clientOtp -clientOtpExpiry')
      .sort({ createdAt: 1 });
    res.json(users);
  } catch (err) { next(err); }
});

const createRules = [
  body('name').trim().escape().notEmpty(),
  body('email').isEmail().normalizeEmail().trim(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role').isIn(['t-1', 't-2']).withMessage('Role must be t-1 or t-2.'),
];

// POST /api/users — create a new internal staff account
router.post('/', validate(createRules), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, email, passwordHash, role,
      avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    });

    await AuditLog.create({
      action: 'USER_CREATED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: user._id, targetName: name,
      detail: `Staff account created: ${email} (${role}).`, ip: req.ip,
    });

    res.status(201).json({
      id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar, active: user.active,
    });
  } catch (err) { next(err); }
});

// PATCH /api/users/:id/toggle — activate / deactivate
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    // Prevent admin from deactivating their own account
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ error: 'Cannot deactivate your own account.' });
    }
    const user = await User.findOne({ _id: req.params.id, role: { $in: ['t-1', 't-2'] } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.active = !user.active;
    await user.save();

    await AuditLog.create({
      action: user.active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      userId: req.user.id, userName: req.user.name, userRole: req.user.role,
      targetId: user._id, targetName: user.name,
      detail: `Account ${user.active ? 'activated' : 'deactivated'}.`, ip: req.ip,
    });

    res.json({ id: user._id, name: user.name, active: user.active });
  } catch (err) { next(err); }
});

export default router;
