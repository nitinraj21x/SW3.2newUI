/**
 * events.js — t-1 only for writes, authenticated for reads
 * Images are uploaded to Cloudinary via multipart form upload.
 */
import { Router } from 'express';
import { body }   from 'express-validator';
import multer     from 'multer';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import Event    from '../models/Event.js';
import AuditLog from '../models/AuditLog.js';
import { uploadBuffer, deleteResource } from '../utils/cloudinary.js';

const router = Router();
router.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

const eventRules = [
  body('type').isIn(['upcoming', 'past']),
  body('title').trim().escape().notEmpty(),
  body('date').trim().escape().notEmpty(),
  body('location').trim().escape().notEmpty(),
  body('description').optional().trim(),
  body('teaser').optional().trim().escape(),
  body('theme').optional().trim().escape(),
  body('facilitator').optional().trim().escape(),
  body('participants').optional().isInt({ min: 0 }),
];

// GET — all authenticated users
router.get('/', async (req, res, next) => {
  try {
    res.json(await Event.find().sort({ createdAt: -1 }));
  } catch (err) { next(err); }
});

// GET public events (no auth — for public website)
router.get('/public', async (req, res, next) => {
  try {
    res.json(await Event.find().sort({ createdAt: -1 }).select('-createdBy'));
  } catch (err) { next(err); }
});

// POST — t-1 only
router.post('/', requireAdmin, validate(eventRules), async (req, res, next) => {
  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });
    await AuditLog.create({
      action: 'EVENT_ADDED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: event._id, targetName: event.title,
      detail: `Event "${event.title}" created.`, ip: req.ip,
    });
    res.status(201).json(event);
  } catch (err) { next(err); }
});

// PATCH — t-1 only
router.patch('/:id', requireAdmin, validate(eventRules), async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id, { ...req.body, updatedAt: new Date() }, { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    await AuditLog.create({
      action: 'EVENT_EDITED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: event._id, targetName: event.title,
      detail: `Event "${event.title}" updated.`, ip: req.ip,
    });
    res.json(event);
  } catch (err) { next(err); }
});

// DELETE — t-1 only
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    // Delete all images from Cloudinary
    for (const img of event.images) {
      if (img.cloudinaryPublicId) {
        await deleteResource(img.cloudinaryPublicId).catch(() => {});
      }
    }

    await AuditLog.create({
      action: 'EVENT_DELETED', userId: req.user.id, userName: req.user.name,
      userRole: req.user.role, targetId: req.params.id, targetName: event.title,
      detail: `Event "${event.title}" deleted.`, ip: req.ip,
    });
    res.json({ message: 'Deleted.' });
  } catch (err) { next(err); }
});

// POST /api/events/:id/images — upload one image to Cloudinary
router.post('/:id/images', requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    const result = await uploadBuffer(req.file.buffer, 'sewingcircle/events', {
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }],
    });

    const imageEntry = {
      url:                result.secure_url,
      cloudinaryPublicId: result.public_id,
      caption:            req.body.caption || '',
    };

    event.images.push(imageEntry);
    await event.save();

    res.json({ image: imageEntry, event });
  } catch (err) { next(err); }
});

// DELETE /api/events/:id/images/:publicId — remove one image
router.delete('/:id/images/:publicId', requireAdmin, async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    const publicId = decodeURIComponent(req.params.publicId);
    await deleteResource(publicId).catch(() => {});

    event.images = event.images.filter((img) => img.cloudinaryPublicId !== publicId);
    await event.save();

    res.json({ message: 'Image removed.', event });
  } catch (err) { next(err); }
});

export default router;
