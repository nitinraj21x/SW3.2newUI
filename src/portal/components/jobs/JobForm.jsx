import { useState, useEffect } from 'react';
import { Modal, ConfirmModal } from '../ui/Modal';
import { Input, Textarea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { SkillInput } from '../ui/SkillTag';

const EMPTY = {
  title: '', client: '', description: '',
  location: '', type: 'Full-time', remote: 'Hybrid',
  salaryMin: '', salaryMax: '',
  requiredSkills: [], emphasisSkill: '', minExperience: '',
  noticePeriod: 'Any', status: 'Active',
};

export function JobForm({ isOpen, onClose, onSave, editingJob }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(editingJob ? JSON.parse(JSON.stringify(editingJob)) : { ...EMPTY });
    setErrors({});
  }, [isOpen, editingJob]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())  e.title  = 'Job title is required';
    if (!form.client.trim()) e.client = 'Client name is required';
    if (form.requiredSkills.length === 0) e.skills = 'At least one skill is required';
    if (!form.emphasisSkill) e.emphasisSkill = 'Select a primary skill';
    else if (!form.requiredSkills.includes(form.emphasisSkill)) e.emphasisSkill = 'Primary skill must be in the skills list';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) setShowConfirm(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={editingJob ? 'Edit Job Order' : 'New Job Order'} size="lg">
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 space-y-5">

            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Job Title" required value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} placeholder="e.g. Senior React Developer" className="col-span-2" />
              <Input label="Client / Company" required value={form.client} onChange={(e) => set('client', e.target.value)} error={errors.client} placeholder="e.g. Acme Corp" />
              <Input label="Location" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="e.g. San Francisco, CA" />
            </div>

            <Textarea label="Job Description" value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} placeholder="Describe the role, responsibilities, and requirements..." />

            <div className="grid grid-cols-3 gap-4">
              <Select label="Employment Type" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {['Full-time', 'Part-time', 'Contract', 'Freelance'].map((t) => <option key={t}>{t}</option>)}
              </Select>
              <Select label="Remote Policy" value={form.remote} onChange={(e) => set('remote', e.target.value)}>
                {['On-site', 'Hybrid', 'Remote'].map((r) => <option key={r}>{r}</option>)}
              </Select>
              <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {['Active', 'On Hold', 'Filled', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="Min Salary ($)" type="number" value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} placeholder="100000" />
              <Input label="Max Salary ($)" type="number" value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} placeholder="140000" />
              <Input label="Min Experience (yrs)" type="number" min="0" value={form.minExperience} onChange={(e) => set('minExperience', Number(e.target.value))} placeholder="3" />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Required Skills <span className="text-red-400">*</span>
              </label>
              <SkillInput skills={form.requiredSkills} onChange={(skills) => {
                set('requiredSkills', skills);
                // Clear emphasisSkill if it's no longer in the list
                if (form.emphasisSkill && !skills.includes(form.emphasisSkill)) {
                  set('emphasisSkill', '');
                }
              }} placeholder="Add required skills..." />
              {errors.skills && <p className="text-xs text-red-400">{errors.skills}</p>}
            </div>

            {/* Emphasis skill */}
            <div className="space-y-1">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Primary / Emphasis Skill <span className="text-red-400">*</span>
                <span className="ml-2 text-xs font-normal" style={{ color: 'var(--text-faint)' }}>The single most important skill for this role</span>
              </label>
              <select
                value={form.emphasisSkill}
                onChange={(e) => set('emphasisSkill', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                <option value="">— Select from skills above —</option>
                {form.requiredSkills.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.emphasisSkill && <p className="text-xs text-red-400">{errors.emphasisSkill}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select label="Required Notice Period" value={form.noticePeriod} onChange={(e) => set('noticePeriod', e.target.value)}>
                {['Any', 'Immediate', '2 weeks', '1 month', '3 months'].map((n) => <option key={n}>{n}</option>)}
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" variant="primary" className="flex-1">{editingJob ? 'Save Changes' : 'Create Job Order'}</Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => onSave(form)}
        title={editingJob ? 'Save Changes?' : 'Create Job Order?'}
        variant="primary"
        confirmLabel={editingJob ? 'Save' : 'Create'}
        message={`${editingJob ? 'Update' : 'Create'} job order "${form.title}" for ${form.client}? Required skills: ${form.requiredSkills.join(', ')}.`}
      />
    </>
  );
}

