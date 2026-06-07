import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FileText, Loader2, AlertTriangle, Plus, Trash2, X, CheckCircle } from 'lucide-react';
import useStore from '../../store/useStore';
import { Input, Textarea, Select } from '../ui/Input';
import { SkillInput } from '../ui/SkillTag';
import { Button } from '../ui/Button';
import { Modal, ConfirmModal } from '../ui/Modal';

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  location: '', noticePeriod: '2 weeks',
  currentRole: '', currentCompany: '',
  totalExperience: '',
  skills: [],
  education: [{ degree: '', institution: '', year: '' }],
  workHistory: [{ company: '', role: '', from: '', to: '', description: '' }],
  status: 'Active',
  notes: '',
  linkedIn: '',
  _resumeUploaded: false,
  _resumeFileName: '',
};

function freshForm(existing) {
  return existing
    ? JSON.parse(JSON.stringify(existing))   // deep clone — no reference sharing
    : JSON.parse(JSON.stringify(EMPTY_FORM)); // deep clone — no reference sharing
}

export function CandidateForm({ isOpen, onClose, editingId }) {
  const { addCandidate, updateCandidate, candidates } = useStore();

  const existing = editingId ? candidates.find((c) => c.id === editingId) : null;

  const [form, setForm] = useState(() => freshForm(existing));
  const [resumeFile, setResumeFile] = useState(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [splitMode, setSplitMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // ── Reset ALL form state whenever the modal opens or switches candidate ────
  useEffect(() => {
    if (!isOpen) return;
    const candidate = editingId ? candidates.find((c) => c.id === editingId) : null;
    setForm(freshForm(candidate));
    setResumeFile(null);
    setResumePreviewUrl(null);
    setIsParsing(false);
    setParseError(null);
    setSplitMode(false);
    setShowConfirm(false);
    setErrors({});
    setIsDragging(false);
    // Reset the file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [isOpen, editingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // ── Resume Upload ──────────────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (file) => {
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|doc)$/i)) {
      setParseError('Please upload a PDF or Word document.');
      return;
    }

    // Reset everything before parsing the new file
    setForm(freshForm(null));
    setParseError(null);
    setErrors({});
    setResumeFile(file);
    setSplitMode(true);

    // Create preview URL for PDF
    if (file.type === 'application/pdf') {
      // Revoke any previous object URL to avoid memory leaks
      setResumePreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
    } else {
      setResumePreviewUrl(null);
    }

    // Parse
    setIsParsing(true);
    try {
      const { parseResume } = await import('../../utils/resumeParser');
      const parsed = await parseResume(file);
      // Replace form entirely with parsed data — no merging with stale state
      setForm({
        ...freshForm(null),
        ...parsed,
        _resumeUploaded: true,
        _resumeFileName: file.name,
      });
    } catch (err) {
      setParseError('Resume parsing failed. Please fill in the fields manually.');
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required';
    if (!form.email.trim())     errs.email     = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address';
    if (!form.currentRole.trim()) errs.currentRole = 'Current role is required';
    if (!form.totalExperience)    errs.totalExperience = 'Experience is required';
    if (form.skills.length === 0) errs.skills = 'At least one skill is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleConfirmedSubmit = () => {
    if (editingId) {
      updateCandidate(editingId, form);
    } else {
      addCandidate(form);
    }
    onClose();
  };

  // ── Work History helpers ───────────────────────────────────────────────────
  const addWorkEntry = () => set('workHistory', [...form.workHistory, { company: '', role: '', from: '', to: '', description: '' }]);
  const removeWorkEntry = (i) => set('workHistory', form.workHistory.filter((_, idx) => idx !== i));
  const updateWork = (i, field, value) => {
    const updated = [...form.workHistory];
    updated[i] = { ...updated[i], [field]: value };
    set('workHistory', updated);
  };

  const addEduEntry = () => set('education', [...form.education, { degree: '', institution: '', year: '' }]);
  const removeEduEntry = (i) => set('education', form.education.filter((_, idx) => idx !== i));
  const updateEdu = (i, field, value) => {
    const updated = [...form.education];
    updated[i] = { ...updated[i], [field]: value };
    set('education', updated);
  };

  const formContent = (
    <div className="space-y-6 p-6">
      {/* Parse status banner */}
      {isParsing && (
        <div className="flex items-center gap-3 px-4 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <Loader2 size={16} className="text-cyan-400 animate-spin shrink-0" />
          <div>
            <p className="text-sm font-medium text-cyan-300">Parsing resume...</p>
            <p className="text-xs text-cyan-400/70">AI extraction in progress. Fields will auto-populate shortly.</p>
          </div>
        </div>
      )}
      {parseError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{parseError}</p>
        </div>
      )}
      {form._resumeUploaded && !isParsing && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-300">Resume parsed: {form._resumeFileName}</p>
            <p className="text-xs text-emerald-400/70">Fields auto-populated. Please review and correct any errors.</p>
          </div>
        </div>
      )}

      {/* Personal Details */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider pb-2 border-b w-full" style={{ color: 'var(--text-faint)', borderColor: 'var(--border-subtle)' }}>Personal Details</legend>
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} error={errors.firstName} placeholder="Jane" />
          <Input label="Last Name"  required value={form.lastName}  onChange={(e) => set('lastName', e.target.value)}  error={errors.lastName}  placeholder="Smith" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} placeholder="jane@email.com" />
          <Input label="Phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1-555-0000" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Location" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="San Francisco, CA" />
          <Select label="Notice Period" value={form.noticePeriod} onChange={(e) => set('noticePeriod', e.target.value)}>
            {['Immediate', '2 weeks', '1 month', '3 months'].map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </div>
        {form.linkedIn !== undefined && (
          <Input label="LinkedIn URL" type="url" value={form.linkedIn} onChange={(e) => set('linkedIn', e.target.value)} placeholder="https://linkedin.com/in/..." />
        )}
      </fieldset>

      {/* Professional Details */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-wider pb-2 border-b w-full" style={{ color: 'var(--text-faint)', borderColor: 'var(--border-subtle)' }}>Professional Details</legend>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Current Role" required value={form.currentRole} onChange={(e) => set('currentRole', e.target.value)} error={errors.currentRole} placeholder="Senior Engineer" />
          <Input label="Current Company" value={form.currentCompany} onChange={(e) => set('currentCompany', e.target.value)} placeholder="Acme Corp" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Total Experience (years)" required type="number" min="0" max="50" value={form.totalExperience} onChange={(e) => set('totalExperience', Number(e.target.value))} error={errors.totalExperience} placeholder="5" />
          <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {['Active', 'Interviewing', 'Placed', 'Inactive', 'Rejected'].map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </fieldset>

      {/* Skills */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider pb-2 border-b w-full" style={{ color: 'var(--text-faint)', borderColor: 'var(--border-subtle)' }}>Skills</legend>
        <SkillInput skills={form.skills} onChange={(skills) => set('skills', skills)} />
        {errors.skills && <p className="text-xs text-red-400">{errors.skills}</p>}
      </fieldset>

      {/* Work History */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider pb-2 border-b w-full flex items-center justify-between" style={{ color: 'var(--text-faint)', borderColor: 'var(--border-subtle)' }}>
          Work History
          <button type="button" onClick={addWorkEntry} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-xs font-medium normal-case tracking-normal">
            <Plus size={12} /> Add Entry
          </button>
        </legend>
        {form.workHistory.map((job, i) => (
          <div key={i} className="rounded-lg p-4 border space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Position {i + 1}</span>
              {form.workHistory.length > 1 && (
                <button type="button" onClick={() => removeWorkEntry(i)} className="hover:text-red-400 transition-colors" style={{ color: 'var(--text-ghost)' }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Company" value={job.company} onChange={(e) => updateWork(i, 'company', e.target.value)} />
              <Input placeholder="Role / Title" value={job.role} onChange={(e) => updateWork(i, 'role', e.target.value)} />
              <Input placeholder="From (e.g. 2020)" value={job.from} onChange={(e) => updateWork(i, 'from', e.target.value)} />
              <Input placeholder="To (e.g. Present)" value={job.to} onChange={(e) => updateWork(i, 'to', e.target.value)} />
            </div>
            <Textarea placeholder="Brief description of responsibilities..." rows={2} value={job.description} onChange={(e) => updateWork(i, 'description', e.target.value)} />
          </div>
        ))}
      </fieldset>

      {/* Education */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider pb-2 border-b w-full flex items-center justify-between" style={{ color: 'var(--text-faint)', borderColor: 'var(--border-subtle)' }}>
          Education
          <button type="button" onClick={addEduEntry} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-xs font-medium normal-case tracking-normal">
            <Plus size={12} /> Add Entry
          </button>
        </legend>
        {form.education.map((edu, i) => (
          <div key={i} className="rounded-lg p-4 border space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--text-faint)' }}>Degree {i + 1}</span>
              {form.education.length > 1 && (
                <button type="button" onClick={() => removeEduEntry(i)} className="hover:text-red-400 transition-colors" style={{ color: 'var(--text-ghost)' }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input className="col-span-2" placeholder="Degree / Qualification" value={edu.degree} onChange={(e) => updateEdu(i, 'degree', e.target.value)} />
              <Input placeholder="Year" type="number" value={edu.year} onChange={(e) => updateEdu(i, 'year', e.target.value)} />
            </div>
            <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateEdu(i, 'institution', e.target.value)} />
          </div>
        ))}
      </fieldset>

      {/* Notes */}
      <Textarea label="Internal Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Internal notes about this candidate..." rows={3} />

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" variant="primary" className="flex-1">
          {editingId ? 'Save Changes' : 'Review & Submit'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingId ? 'Edit Candidate' : 'Add New Candidate'}
        size={splitMode ? 'full' : 'lg'}
      >
        <form onSubmit={handleSubmitClick} noValidate>
          {splitMode ? (
            <div className="flex h-[80vh]">
              {/* Left: Resume Preview */}
              <div className="w-1/2 border-r flex flex-col" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <FileText size={14} style={{ color: 'var(--text-faint)' }} />
                    <span className="text-sm font-medium truncate max-w-xs" style={{ color: 'var(--text-secondary)' }}>{resumeFile?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSplitMode(false); setResumeFile(null); setResumePreviewUrl(null); setForm(freshForm(null)); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="p-1 rounded transition-colors"
                    style={{ color: 'var(--text-faint)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)'; }}
                    aria-label="Close preview"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
                  {resumePreviewUrl ? (
                    <iframe
                      src={resumePreviewUrl}
                      title="Resume preview"
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <FileText size={40} className="mb-3" style={{ color: 'var(--text-ghost)' }} />
                      <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Preview not available for .docx files.</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>Fields have been auto-populated from the document.</p>
                    </div>
                  )}
                </div>
              </div>
              {/* Right: Form */}
              <div className="w-1/2 overflow-y-auto">
                {formContent}
              </div>
            </div>
          ) : (
            <>
              {/* Upload zone */}
              {!editingId && (
                <div className="px-6 pt-6">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className="border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer"
                    style={{
                      borderColor: isDragging ? 'var(--accent)' : 'var(--border-default)',
                      backgroundColor: isDragging ? 'var(--accent-dim)' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }}
                    onMouseLeave={(e) => { if (!isDragging) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                    aria-label="Upload resume"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                    <Upload size={24} className="mx-auto mb-2" style={{ color: isDragging ? 'var(--accent)' : 'var(--text-faint)' }} />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {isDragging ? 'Drop to upload' : 'Upload Resume (Optional)'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>PDF or Word · Drag & drop or click · Auto-fills form fields</p>
                  </div>
                </div>
              )}
              {formContent}
            </>
          )}
        </form>
      </Modal>

      {/* Two-step confirmation */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmedSubmit}
        title="Confirm Candidate Data"
        variant="primary"
        confirmLabel={editingId ? 'Save Changes' : 'Confirm & Save'}
        message={
          form._resumeUploaded
            ? `Please review the extracted data carefully. Confirm that all skills (${form.skills.slice(0, 5).join(', ')}${form.skills.length > 5 ? '...' : ''}) and contact details are accurate before final storage.`
            : `You are about to ${editingId ? 'update' : 'add'} ${form.firstName} ${form.lastName}'s profile. Please confirm all details are correct.`
        }
      />
    </>
  );
}

