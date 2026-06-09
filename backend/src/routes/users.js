/**
 * users.js — /api/users
 *
 * Only the `admin` role can manage staff accounts (t-1, t-2).
 * t-1 staff have full portal access but CANNOT create or modify accounts.
 * t-3 clients are managed separately via /api/auth/clients.
 *
 * When a new user is created:
 *   - Admin sets a temporary password
 *   - mustChangePassword = true
 *   - On first login, user is forced to set a new strong password before
 *     proceeding to TOTP setup and portal access
 */
import { Router } from 'express';
import { body }   from 'express-validator';
import bcrypt     from 'bcryptjs';
import { requireAuth, requireSuperAdmin } from '../middleware/auth.js';
import { validate }   from '../middleware/validate.js';
import User     from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

const router = Router();
// All user-management routes: admin only
router.use(requireAuth, requireSuperAdmin);

const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

// ── GET /api/users — list all staff (admin, t-1, t-2) ────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find({ role: { $in: ['admin', 't-1', 't-2'] } })
      .select('-passwordHash -totpSecret -clientOtp -clientOtpExpiry')
      .sort({ createdAt: 1 });
    res.json(users);
  } catch (err) { next(err); }
});

// ── POST /api/users — create a new staff account (t-1 or t-2 only) ───────────
const createRules = [
  body('name').trim().escape().notEmpty().withMessage('Name required.'),
  body('email').isEmail().normalizeEmail().trim().withMessage('Valid email required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(PW_REGEX).withMessage('Password must contain uppercase, lowercase, a number and a special character.'),
  body('role').isIn(['t-1', 't-2']).withMessage('Role must be t-1 or t-2. Admin accounts cannot be created via this endpoint.'),
];

router.post('/', validate(createRules), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, email, passwordHash, role,
      avatar:              name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      mustChangePassword:  true,   // forces password reset on first login
      totpEnabled:         false,  // TOTP configured on first login after password change
    });

    await AuditLog.create({
      action: 'USER_CREATED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: user._id, targetName: name,
      detail: `Staff account created: ${email} (${role}). Must change password on first login.`,
      ip: req.ip,
    });

    res.status(201).json({
      id: user._id, name: user.name, email: user.email,
      role: user.role, avatar: user.avatar, active: user.active,
      mustChangePassword: user.mustChangePassword,
    });
  } catch (err) { next(err); }
});

// ── PATCH /api/users/:id — update name or role ────────────────────────────────
router.patch('/:id', validate([
  body('name').optional().trim().escape().notEmpty(),
  body('role').optional().isIn(['t-1', 't-2']).withMessage('Role must be t-1 or t-2.'),
]), async (req, res, next) => {
  try {
    // Prevent modifying another admin account (protect from privilege misuse)
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found.' });
    if (target.role === 'admin') return res.status(403).json({ error: 'Admin accounts cannot be modified.' });

    const { name, role } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (role) updates.role = role;

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true });

    await AuditLog.create({
      action: 'USER_UPDATED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: updated._id, targetName: updated.name,
      detail: `Updated: ${Object.keys(updates).join(', ')}.`, ip: req.ip,
    });

    res.json({ id: updated._id, name: updated.name, email: updated.email, role: updated.role, active: updated.active });
  } catch (err) { next(err); }
});

// ── PATCH /api/users/:id/toggle — activate / deactivate ──────────────────────
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ error: 'Cannot deactivate your own account.' });
    }
    const user = await User.findOne({ _id: req.params.id, role: { $in: ['t-1', 't-2'] } });
    if (!user) return res.status(404).json({ error: 'User not found or cannot deactivate admin accounts.' });

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

// ── PATCH /api/users/:id/reset-password — admin resets a user's temp password ─
router.patch('/:id/reset-password', validate([
  body('password')
    .isLength({ min: 8 })
    .matches(PW_REGEX).withMessage('Password must contain uppercase, lowercase, a number and a special character.'),
]), async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: { $in: ['t-1', 't-2'] } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const passwordHash = await bcrypt.hash(req.body.password, 12);
    // Clear TOTP so the user sets it up fresh after the new password
    await User.findByIdAndUpdate(req.params.id, {
      passwordHash,
      mustChangePassword: true,
      totpEnabled: false,
      totpSecret: null,
      totpVerifiedAt: null,
      totpFailCount: 0,
      totpLockedUntil: null,
    });

    await AuditLog.create({
      action: 'PASSWORD_RESET_BY_ADMIN', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: user._id, targetName: user.name,
      detail: `Password reset by admin. User must change on next login.`, ip: req.ip,
    });

    res.json({ message: 'Password reset. User will be prompted to change it on next login.' });
  } catch (err) { next(err); }
});

// ── DELETE /api/users/:id — permanently delete a staff account ────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ error: 'Cannot delete your own account.' });
    }
    const user = await User.findOneAndDelete({ _id: req.params.id, role: { $in: ['t-1', 't-2'] } });
    if (!user) return res.status(404).json({ error: 'User not found or cannot delete admin accounts.' });

    await AuditLog.create({
      action: 'USER_DELETED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: req.params.id, targetName: user.name,
      detail: `Staff account deleted: ${user.email} (${user.role}).`, ip: req.ip,
    });

    res.json({ message: 'User deleted.' });
  } catch (err) { next(err); }
});

export default router;
