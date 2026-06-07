import { X, Edit2, Trash2, MapPin, Clock, Briefcase, DollarSign, Users, Building2, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import useStore, { PERMISSIONS } from '../../store/useStore';
import { Button } from '../ui/Button';
import { SkillTag } from '../ui/SkillTag';
import { JobCandidateList } from './JobCandidateList';

const STATUS_STYLES = {
  Active:    { bg: 'rgba(16,185,129,0.12)',  text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  'On Hold': { bg: 'rgba(234,179,8,0.12)',   text: '#fbbf24', border: 'rgba(234,179,8,0.3)' },
  Filled:    { bg: 'rgba(6,182,212,0.12)',  text: 'var(--accent-light)', border: 'rgba(6,182,212,0.3)' },
  Cancelled: { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
      <Icon size={14} style={{ color: 'var(--text-faint)' }} />
      <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
        {title}
      </h3>
    </div>
  );
}

export function JobDetail({ jobId, onClose, onEdit, onViewCandidate }) {
  const { jobs, candidates, currentUser, deleteJob } = useStore();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;

  const sc      = STATUS_STYLES[job.status] || STATUS_STYLES.Active;
  const canEdit  = PERMISSIONS.canEditJob(currentUser.role);   // t-1 only
  const canDelete= PERMISSIONS.canDeleteJob(currentUser.role); // t-1 only

  const handleDelete = () => {
    if (window.confirm(`Delete job order "${job.title}"? This cannot be undone.`)) {
      deleteJob(job.id);
      onClose();
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };

  const salary = job.salaryMin && job.salaryMax
    ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`${job.title} job order`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center gap-4 px-6 py-3 border-b"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        {/* Icon + title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center shrink-0">
            <Briefcase size={18} className="text-cyan-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {job.title}
            </h1>
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Building2 size={11} />{job.client}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-wrap">
            <span
              className="px-2.5 py-0.5 rounded-md text-xs font-semibold border"
              style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}
            >
              {job.status}
            </span>
            {job.type && (
              <span className="text-xs px-2 py-0.5 rounded border"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', borderColor: 'var(--border-default)' }}>
                {job.type}
              </span>
            )}
            {job.remote && (
              <span className="text-xs px-2 py-0.5 rounded border"
                style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', borderColor: 'var(--border-default)' }}>
                {job.remote}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {canEdit && (
            <Button variant="secondary" size="sm" icon={Edit2} onClick={onEdit}>
              Edit
            </Button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; e.currentTarget.style.color = '#f87171'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              aria-label="Delete job"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            aria-label="Close"
          >
            <X size={15} />
            Close
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: meta + skills ─────────────────────────────── */}
          <div className="space-y-5">

            {/* Meta stats */}
            <div className="rounded-xl border p-4 space-y-3"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <SectionHeader icon={Briefcase} title="Job Details" />
              <div className="space-y-2">
                {[
                  { icon: MapPin,     label: 'Location',   value: job.location || '—' },
                  { icon: Briefcase,  label: 'Experience', value: job.minExperience ? `${job.minExperience}+ years` : 'Flexible' },
                  { icon: Clock,      label: 'Notice',     value: job.noticePeriod || 'Any' },
                  { icon: DollarSign, label: 'Salary',     value: salary || 'Not specified' },
                  { icon: Calendar,   label: 'Posted',     value: job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 py-1.5 border-b last:border-0"
                    style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: 'var(--bg-elevated)' }}>
                      <Icon size={13} style={{ color: 'var(--text-faint)' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>{label}</p>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required skills */}
            <div className="rounded-xl border p-4 space-y-3"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <SectionHeader icon={Briefcase} title={`Required Skills · ${(job.requiredSkills || []).length}`} />
              <div className="flex flex-wrap gap-1.5">
                {(job.requiredSkills || []).map((skill) => (
                  <SkillTag key={skill} skill={skill} highlight={skill === job.emphasisSkill} />
                ))}
              </div>
              {job.emphasisSkill && (
                <p className="text-xs pt-1" style={{ color: 'var(--text-faint)' }}>
                  <span className="text-yellow-400">★</span> Primary:{' '}
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{job.emphasisSkill}</span>
                </p>
              )}
            </div>
          </div>

          {/* ── Right 2 columns: description + candidate scores ─────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            {job.description && (
              <div className="rounded-xl border p-5 space-y-3"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <SectionHeader icon={FileText} title="Description" />
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {job.description}
                </p>
              </div>
            )}

            {/* Candidate match scores */}
            <div className="rounded-xl border p-5 space-y-4"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <SectionHeader icon={Users} title={`Candidate Match Scores · ${candidates.length} candidates`} />
              <JobCandidateList
                job={job}
                candidates={candidates}
                onViewCandidate={onViewCandidate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

