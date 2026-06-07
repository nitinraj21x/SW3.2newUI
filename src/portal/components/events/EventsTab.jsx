import { useState, useRef } from 'react';
import {
  Plus, Edit2, Trash2, Calendar, MapPin, Users, Clock,
  ChevronLeft, ChevronRight, X, Image, Upload, ExternalLink,
  CalendarDays, Eye, Loader2,
} from 'lucide-react';
import useStore from '../../store/useStore';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { Modal, ConfirmModal } from '../ui/Modal';
import { ProtectedImage } from '../ui/ProtectedImage';
import { applyWatermark } from '../../utils/watermark';

// ─── Event Form ───────────────────────────────────────────────────────────────
const EMPTY_EVENT = {
  type: 'past', title: '', date: '', time: '', location: '', venueUrl: '',
  theme: '', teaser: '', description: '', participants: '', facilitator: '',
  duration: '2 hours', images: [], coverImageIndex: 0,
};

function EventForm({ isOpen, onClose, onSave, editingEvent }) {
  const [form, setForm]           = useState(() => editingEvent ? JSON.parse(JSON.stringify(editingEvent)) : { ...EMPTY_EVENT });
  const [errors, setErrors]       = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [watermarking, setWatermarking]   = useState(false);
  const fileInputRef = useRef(null);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = 'Title is required';
    if (!form.date.trim())     e.date     = 'Date is required';
    if (!form.location.trim()) e.location = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => { ev.preventDefault(); if (validate()) setShowConfirm(true); };

  // Add image by URL — watermark it
  const addImageUrl = async () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setWatermarking(true);
    try {
      const watermarked = await applyWatermark(url);
      set('images', [...form.images, { url: watermarked, caption: '', original: url }]);
    } catch {
      // If watermarking fails (e.g. CORS), add original
      set('images', [...form.images, { url, caption: '' }]);
    } finally {
      setWatermarking(false);
      setImageUrlInput('');
    }
  };

  // Add image by file — watermark it
  const handleFileAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setWatermarking(true);
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            const watermarked = await applyWatermark(file);
            return { url: watermarked, caption: file.name };
          } catch {
            // Fallback: read without watermark
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (ev) => resolve({ url: ev.target.result, caption: file.name });
              reader.readAsDataURL(file);
            });
          }
        })
      );
      setForm((f) => ({ ...f, images: [...f.images, ...results] }));
    } finally {
      setWatermarking(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx) => {
    const updated = form.images.filter((_, i) => i !== idx);
    set('images', updated);
    if (form.coverImageIndex >= updated.length) set('coverImageIndex', 0);
  };

  const updateCaption = (idx, caption) => {
    const updated = [...form.images];
    updated[idx] = { ...updated[idx], caption };
    set('images', updated);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={editingEvent ? 'Edit Event' : 'Add New Event'} size="lg">
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 space-y-5">
            <Select label="Event Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="upcoming">Upcoming Event</option>
              <option value="past">Past Event</option>
            </Select>

            <Input label="Event Title" required value={form.title}
              onChange={(e) => set('title', e.target.value)} error={errors.title}
              placeholder="e.g. Sewing Circle Coffee Meetup – April 2026" />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Date" required value={form.date} onChange={(e) => set('date', e.target.value)} error={errors.date} placeholder="e.g. April 25, 2026" />
              <Input label="Time" value={form.time} onChange={(e) => set('time', e.target.value)} placeholder="e.g. 4:00 PM" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Location" required value={form.location} onChange={(e) => set('location', e.target.value)} error={errors.location} placeholder="e.g. Haraz Coffee House, Frisco" />
              <Input label="Venue URL (optional)" type="url" value={form.venueUrl} onChange={(e) => set('venueUrl', e.target.value)} placeholder="https://maps.google.com/..." />
            </div>

            {form.type === 'past' && (
              <>
                <Input label="Theme" value={form.theme} onChange={(e) => set('theme', e.target.value)} placeholder="e.g. Nine minds, one table, and AI" />
                <Input label="Teaser (short summary)" value={form.teaser} onChange={(e) => set('teaser', e.target.value)} placeholder="One-line summary shown on the card..." />
                <div className="grid grid-cols-3 gap-4">
                  <Input label="Participants" type="number" value={form.participants} onChange={(e) => set('participants', e.target.value)} placeholder="12" />
                  <Input label="Facilitator" value={form.facilitator} onChange={(e) => set('facilitator', e.target.value)} placeholder="Asha" />
                  <Input label="Duration" value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="2 hours" />
                </div>
              </>
            )}

            <Textarea label="Full Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} placeholder="Detailed description of the event..." />

            {/* Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Event Images
                </label>
                {watermarking && (
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent-light)' }}>
                    <Loader2 size={12} className="animate-spin" /> Applying watermark…
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input type="url" placeholder="Paste image URL..."
                  value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                  disabled={watermarking} />
                <Button type="button" variant="secondary" size="sm" onClick={addImageUrl} disabled={watermarking}>Add URL</Button>
              </div>

              <div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileAdd} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={watermarking}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors w-full justify-center disabled:opacity-50"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { if (!watermarking) { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent-light)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  <Upload size={14} /> Upload from device (watermark applied automatically)
                </button>
              </div>

              {form.images.length > 0 && (
                <div className="space-y-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border"
                      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                      <ProtectedImage src={img.url} alt={img.caption || `Image ${idx + 1}`}
                        className="w-12 h-12 rounded shrink-0" style={{ aspectRatio: '1' }} />
                      <div className="flex-1 min-w-0 space-y-1">
                        <input type="text" placeholder="Caption (optional)" value={img.caption}
                          onChange={(e) => updateCaption(idx, e.target.value)}
                          className="w-full px-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
                        <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--text-faint)' }}>
                          <input type="radio" name="coverImage" checked={form.coverImageIndex === idx}
                            onChange={() => set('coverImageIndex', idx)} className="accent-cyan-500" />
                          Set as cover
                        </label>
                      </div>
                      <button type="button" onClick={() => removeImage(idx)}
                        className="p-1 rounded transition-colors hover:text-red-400 shrink-0"
                        style={{ color: 'var(--text-ghost)' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={watermarking}>
                {editingEvent ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={showConfirm} onClose={() => setShowConfirm(false)}
        onConfirm={() => onSave(form)} title={editingEvent ? 'Save Changes?' : 'Create Event?'}
        variant="primary" confirmLabel={editingEvent ? 'Save' : 'Create'}
        message={`${editingEvent ? 'Update' : 'Create'} event "${form.title}" on ${form.date}?`} />
    </>
  );
}

// ─── Protected Image Gallery ──────────────────────────────────────────────────
function ImageGallery({ images, coverIndex = 0 }) {
  const [current, setCurrent] = useState(coverIndex);
  if (!images || images.length === 0) return (
    <div className="w-full h-40 rounded-xl flex items-center justify-center group"
      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
      <Image size={28} style={{ color: 'var(--text-ghost)' }} />
    </div>
  );
  return (
    <div className="relative rounded-xl overflow-hidden group" style={{ aspectRatio: '16/9' }}>
      <ProtectedImage src={images[current]?.url} alt={images[current]?.caption || ''}
        className="w-full h-full" style={{ aspectRatio: '16/9' }} />
      {images.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-20"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}>
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center z-20"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}>
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ backgroundColor: i === current ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Event Detail Modal ───────────────────────────────────────────────────────
function EventDetailModal({ event, onClose, onEdit, onDelete }) {
  if (!event) return null;
  return (
    <Modal isOpen={!!event} onClose={onClose} title={event.title} size="lg">
      <div className="p-6 space-y-5">
        <ImageGallery images={event.images} coverIndex={event.coverImageIndex} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Calendar, label: 'Date',         value: event.date },
            { icon: Clock,    label: 'Time',         value: event.time || '—' },
            { icon: MapPin,   label: 'Location',     value: event.location },
            { icon: Users,    label: 'Participants', value: event.participants ? `${event.participants} members` : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg p-3 border"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={12} style={{ color: 'var(--text-faint)' }} />
                <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>{label}</p>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{value}</p>
            </div>
          ))}
        </div>
        {event.theme && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-faint)' }}>Theme</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{event.theme}</p>
          </div>
        )}
        {event.description && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-faint)' }}>Description</p>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{event.description}</p>
          </div>
        )}
        {event.venueUrl && (
          <a href={event.venueUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
            <ExternalLink size={14} /> View Venue Location
          </a>
        )}
        <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <Button variant="secondary" size="sm" icon={Edit2} onClick={onEdit} className="flex-1">Edit</Button>
          <Button variant="danger" size="sm" icon={Trash2} onClick={onDelete} className="flex-1">Delete</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main EventsTab ───────────────────────────────────────────────────────────
export function EventsTab() {
  const { events, addEvent, updateEvent, deleteEvent } = useStore();
  const [formOpen, setFormOpen]         = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [typeFilter, setTypeFilter]     = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered      = events.filter((e) => typeFilter === 'all' ? true : e.type === typeFilter);
  const upcomingCount = events.filter((e) => e.type === 'upcoming').length;
  const pastCount     = events.filter((e) => e.type === 'past').length;

  const openNew  = () => { setEditingEvent(null); setFormOpen(true); };
  const openEdit = (ev) => { setEditingEvent(ev); setFormOpen(true); setViewingEvent(null); };

  const handleSave = (data) => {
    if (editingEvent) updateEvent(editingEvent.id, data);
    else addEvent(data);
    setFormOpen(false);
    setEditingEvent(null);
  };

  const handleDelete = (ev) => { setDeleteTarget(ev); setViewingEvent(null); };
  const confirmDelete = () => { if (deleteTarget) deleteEvent(deleteTarget.id); setDeleteTarget(null); };

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Events Manager</h2>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {upcomingCount} upcoming · {pastCount} past · images watermarked automatically
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={openNew}>Add Event</Button>
      </div>

      <div className="flex items-center gap-1.5">
        {[
          { id: 'all', label: 'All', count: events.length },
          { id: 'upcoming', label: 'Upcoming', count: upcomingCount },
          { id: 'past', label: 'Past', count: pastCount },
        ].map(({ id, label, count }) => (
          <button key={id} onClick={() => setTypeFilter(id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={typeFilter === id ? {
              backgroundColor: 'var(--accent-dim)', color: 'var(--accent-light)', borderColor: 'var(--accent-border)',
            } : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)', borderColor: 'var(--border-default)' }}>
            {label} <span style={{ color: 'var(--text-ghost)' }}>({count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <CalendarDays size={36} className="mb-3" style={{ color: 'var(--text-ghost)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No events yet</p>
          <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-ghost)' }}>Add events here to manage what appears on the public website.</p>
          <Button variant="primary" size="sm" icon={Plus} onClick={openNew}>Add First Event</Button>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ev) => {
            const isUpcoming = ev.type === 'upcoming';
            const coverImg   = ev.images?.[ev.coverImageIndex ?? 0]?.url;
            return (
              <div key={ev.id}
                className="rounded-xl border flex flex-col overflow-hidden transition-all duration-150 cursor-pointer group"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                onClick={() => setViewingEvent(ev)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setViewingEvent(ev)}>

                {/* Cover image — protected */}
                {coverImg ? (
                  <ProtectedImage src={coverImg} alt={ev.title}
                    className="h-36 shrink-0 transition-transform duration-300 group-hover:scale-105"
                    style={{ height: '9rem' }} />
                ) : (
                  <div className="h-36 flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isUpcoming ? 'var(--accent-dim)' : 'var(--bg-elevated)' }}>
                    <CalendarDays size={28} style={{ color: isUpcoming ? 'var(--accent)' : 'var(--text-ghost)' }} />
                  </div>
                )}

                <div className="px-4 py-3 flex-1 space-y-2">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold border"
                    style={isUpcoming ? {
                      backgroundColor: 'var(--accent-dim)', color: 'var(--accent-light)', borderColor: 'var(--accent-border)',
                    } : { backgroundColor: 'rgba(168,85,247,0.1)', color: '#c084fc', borderColor: 'rgba(168,85,247,0.25)' }}>
                    {isUpcoming ? 'Upcoming' : 'Past'}
                  </span>
                  <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{ev.title}</p>
                  {ev.theme && <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{ev.theme}</p>}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--text-faint)' }}>
                    {ev.date     && <span className="flex items-center gap-1"><Calendar size={10} />{ev.date}</span>}
                    {ev.time     && <span className="flex items-center gap-1"><Clock size={10} />{ev.time}</span>}
                    {ev.location && <span className="flex items-center gap-1"><MapPin size={10} />{ev.location}</span>}
                    {ev.participants && <span className="flex items-center gap-1"><Users size={10} />{ev.participants} members</span>}
                  </div>
                  {ev.teaser && <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{ev.teaser}</p>}
                </div>

                <div className="px-4 py-2.5 border-t flex items-center justify-between"
                  style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                    {ev.images?.length || 0} image{ev.images?.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {[
                      { icon: Eye,    action: () => setViewingEvent(ev), title: 'View',   hover: 'var(--accent-light)', hoverBg: 'var(--accent-dim)' },
                      { icon: Edit2,  action: () => openEdit(ev),        title: 'Edit',   hover: 'var(--accent-light)', hoverBg: 'var(--accent-dim)' },
                      { icon: Trash2, action: () => handleDelete(ev),    title: 'Delete', hover: '#f87171',             hoverBg: 'rgba(239,68,68,0.1)' },
                    ].map(({ icon: Icon, action, title, hover, hoverBg }) => (
                      <button key={title} onClick={action}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-faint)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = hover; e.currentTarget.style.backgroundColor = hoverBg; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.backgroundColor = ''; }}
                        title={title}>
                        <Icon size={13} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EventDetailModal event={viewingEvent} onClose={() => setViewingEvent(null)}
        onEdit={() => openEdit(viewingEvent)} onDelete={() => handleDelete(viewingEvent)} />

      <EventForm isOpen={formOpen} onClose={() => { setFormOpen(false); setEditingEvent(null); }}
        onSave={handleSave} editingEvent={editingEvent} />

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete} title="Delete Event?" variant="danger" confirmLabel="Delete"
        message={`Permanently delete "${deleteTarget?.title}"? This cannot be undone.`} />
    </div>
  );
}
