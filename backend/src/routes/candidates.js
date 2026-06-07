/**
 * candidates.js
 *
 * Data isolation per tier (enforced at query level — not just application level):
 *   t-1 : sees ALL candidates
 *   t-2 : sees ONLY candidates they added (addedBy === their userId)
 *   t-3 : sees ONLY candidates in their sharedWith array, with sensitive fields stripped
 */
import { Router }      from 'express';
import { body, param } from 'express-validator';
import multer          from 'multer';
import { requireAuth, requireRecruiter, requireAdmin } from '../middleware/auth.js';
import { validate }    from '../middleware/validate.js';
import Candidate       from '../models/Candidate.js';
import AuditLog        from '../models/AuditLog.js';
import { uploadBuffer, deleteResource } from '../utils/cloudinary.js';

const router = Router();
router.use(requireAuth);

// Multer — memory storage for Cloudinary streaming
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Fields that t-3 clients must NEVER see
const T3_EXCLUDED_FIELDS = { notes: 0, addedBy: 0, sharedWith: 0, resumeUrl: 0, resumePublicId: 0 };

const candidateRules = [
  body('firstName').trim().escape().notEmpty().withMessage('First name required.'),
  body('lastName').trim().escape().notEmpty().withMessage('Last name required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('phone').optional().trim().escape(),
  body('location').optional().trim().escape(),
  body('currentRole').trim().escape().notEmpty().withMessage('Current role required.'),
  body('totalExperience').isInt({ min: 0, max: 60 }).withMessage('Experience must be 0–60.'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill required.'),
  body('skills.*').trim().escape(),
  body('status').isIn(['Active', 'Interviewing', 'Placed', 'Inactive', 'Rejected']),
];

// ── GET /api/candidates ───────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    let query = {};
    let projection = {};

    if (req.user.role === 't-2') {
      // t-2 sees only their own candidates
      query = { addedBy: req.user.id };
    } else if (req.user.role === 't-3') {
      // t-3 sees only shared candidates, with sensitive fields removed
      query = { sharedWith: req.user.id };
      projection = T3_EXCLUDED_FIELDS;
    }
    // t-1 sees all — no filter

    const candidates = await Candidate.find(query, projection).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) { next(err); }
});

// ── GET /api/candidates/:id ───────────────────────────────────────────────────
router.get('/:id', validate([param('id').isMongoId()]), async (req, res, next) => {
  try {
    let candidate;

    if (req.user.role === 't-3') {
      // t-3: must be in sharedWith AND get stripped fields
      candidate = await Candidate.findOne(
        { _id: req.params.id, sharedWith: req.user.id },
        T3_EXCLUDED_FIELDS
      );
    } else if (req.user.role === 't-2') {
      candidate = await Candidate.findOne({ _id: req.params.id, addedBy: req.user.id });
    } else {
      candidate = await Candidate.findById(req.params.id);
    }

    if (!candidate) return res.status(404).json({ error: 'Candidate not found.' });
    res.json(candidate);
  } catch (err) { next(err); }
});

// ── POST /api/candidates ──────────────────────────────────────────────────────
router.post('/', requireRecruiter, validate(candidateRules), async (req, res, next) => {
  try {
    const candidate = await Candidate.create({
      ...req.body,
      addedBy:    req.user.id,
      sharedWith: [],
    });
    await AuditLog.create({
      action: 'CANDIDATE_ADDED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: candidate._id,
      targetName: `${candidate.firstName} ${candidate.lastName}`,
      detail: 'Candidate profile created.', ip: req.ip,
    });
    res.status(201).json(candidate);
  } catch (err) { next(err); }
});

// ── PATCH /api/candidates/:id ─────────────────────────────────────────────────
router.patch('/:id', requireRecruiter, validate(candidateRules), async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found.' });

    if (req.user.role === 't-2' && String(candidate.addedBy) !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit candidates you added.' });
    }

    // Strip write-protected fields from body
    const { addedBy, sharedWith, resumeUrl, resumePublicId, ...safeBody } = req.body;

    const updated = await Candidate.findByIdAndUpdate(
      req.params.id,
      { ...safeBody, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    await AuditLog.create({
      action: 'CANDIDATE_EDITED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: updated._id,
      targetName: `${updated.firstName} ${updated.lastName}`,
      detail: 'Candidate profile updated.', ip: req.ip,
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// ── DELETE /api/candidates/:id — t-1 only ────────────────────────────────────
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found.' });

    // Delete resume from Cloudinary if present
    if (candidate.resumePublicId) {
      await deleteResource(candidate.resumePublicId, 'raw').catch(() => {});
    }

    await AuditLog.create({
      action: 'CANDIDATE_DELETED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: req.params.id,
      targetName: `${candidate.firstName} ${candidate.lastName}`,
      detail: 'Candidate permanently deleted.', ip: req.ip,
    });
    res.json({ message: 'Deleted.' });
  } catch (err) { next(err); }
});

// ── PATCH /api/candidates/:id/share — t-1 and t-2 ────────────────────────────
router.patch('/:id/share', requireRecruiter, async (req, res, next) => {
  try {
    const { clientUserId, action } = req.body; // action: 'add' | 'remove'
    if (!clientUserId) return res.status(400).json({ error: 'clientUserId required.' });

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found.' });

    // t-2 can only share their own candidates
    if (req.user.role === 't-2' && String(candidate.addedBy) !== req.user.id) {
      return res.status(403).json({ error: 'You can only share candidates you added.' });
    }

    const already = candidate.sharedWith.map(String).includes(clientUserId);
    const removing = action === 'remove' || (action !== 'add' && already);
    const sharedWith = removing
      ? candidate.sharedWith.filter((id) => String(id) !== clientUserId)
      : [...candidate.sharedWith, clientUserId];

    const updated = await Candidate.findByIdAndUpdate(
      req.params.id, { sharedWith, updatedAt: new Date() }, { new: true }
    );

    await AuditLog.create({
      action: 'PROFILE_SHARED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: updated._id,
      targetName: `${updated.firstName} ${updated.lastName}`,
      detail: removing ? `Unshared from client ${clientUserId}.` : `Shared with client ${clientUserId}.`,
      ip: req.ip,
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// ── POST /api/candidates/:id/resume — upload resume PDF to Cloudinary ─────────
router.post('/:id/resume', requireRecruiter, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found.' });
    if (req.user.role === 't-2' && String(candidate.addedBy) !== req.user.id) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    // Delete old resume if exists
    if (candidate.resumePublicId) {
      await deleteResource(candidate.resumePublicId, 'raw').catch(() => {});
    }

    const result = await uploadBuffer(
      req.file.buffer,
      'sewingcircle/resumes',
      { resource_type: 'raw', format: 'pdf' }
    );

    const updated = await Candidate.findByIdAndUpdate(
      req.params.id,
      { resumeUrl: result.secure_url, resumePublicId: result.public_id, updatedAt: new Date() },
      { new: true }
    );

    await AuditLog.create({
      action: 'RESUME_UPLOADED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: updated._id,
      targetName: `${updated.firstName} ${updated.lastName}`,
      detail: `Resume uploaded to Cloudinary.`, ip: req.ip,
    });

    res.json({ resumeUrl: result.secure_url });
  } catch (err) { next(err); }
});

export default router;
