import { Router } from 'express';
import { body }   from 'express-validator';
import { requireAuth, requireAdmin, requireRecruiter } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Job      from '../models/Job.js';
import AuditLog from '../models/AuditLog.js';

const router = Router();
router.use(requireAuth);

const jobRules = [
  body('title').trim().escape().notEmpty(),
  body('client').trim().escape().notEmpty(),
  body('requiredSkills').isArray({ min: 1 }),
  body('requiredSkills.*').trim().escape(),
  body('emphasisSkill').trim().escape().notEmpty(),
  body('status').isIn(['Active','On Hold','Filled','Cancelled']),
  body('minExperience').optional().isInt({ min: 0 }),
];

// GET — t-1 and t-2
router.get('/', requireRecruiter, async (req, res, next) => {
  try { res.json(await Job.find().sort({ createdAt: -1 })); }
  catch (err) { next(err); }
});

// POST — t-1 only
router.post('/', requireAdmin, validate(jobRules), async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, createdBy: req.user.id });
    await AuditLog.create({ action: 'JOB_ADDED', userId: req.user.id, userName: req.user.name, userRole: req.user.role, targetId: job._id, targetName: job.title, detail: `Job "${job.title}" created for ${job.client}.`, ip: req.ip });
    res.status(201).json(job);
  } catch (err) { next(err); }
});

// PATCH — t-1 only
router.patch('/:id', requireAdmin, validate(jobRules), async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    await AuditLog.create({ action: 'JOB_EDITED', userId: req.user.id, userName: req.user.name, userRole: req.user.role, targetId: job._id, targetName: job.title, detail: `Job "${job.title}" updated.`, ip: req.ip });
    res.json(job);
  } catch (err) { next(err); }
});

// DELETE — t-1 only
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    await AuditLog.create({ action: 'JOB_DELETED', userId: req.user.id, userName: req.user.name, userRole: req.user.role, targetId: req.params.id, targetName: job.title, detail: `Job "${job.title}" deleted.`, ip: req.ip });
    res.json({ message: 'Deleted.' });
  } catch (err) { next(err); }
});

export default router;
