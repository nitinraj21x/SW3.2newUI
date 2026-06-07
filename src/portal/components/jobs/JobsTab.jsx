import { useState } from 'react';
import { Plus, Search, Briefcase, MapPin, Clock, DollarSign, Edit2, ChevronRight, Eye } from 'lucide-react';
import { format } from 'date-fns';
import useStore, { PERMISSIONS } from '../../store/useStore';
import { Button } from '../ui/Button';
import { JobForm } from './JobForm';
import { JobDetail } from './JobDetail';
import { CandidateDetail } from '../candidates/CandidateDetail';
import { CandidateForm } from '../candidates/CandidateForm';

const STATUS_STYLES = {
  Active:    { bg: 'rgba(16,185,129,0.1)',  text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  'On Hold': { bg: 'rgba(234,179,8,0.1)',   text: '#fbbf24', border: 'rgba(234,179,8,0.3)' },
  Filled:    { bg: 'rgba(6,182,212,0.1)',  text: 'var(--accent-light)', border: 'rgba(6,182,212,0.3)' },
  Cancelled: { bg: 'rgba(239,68,68,0.1)',   text: '#f87171', border: 'rgba(239,68,68,0.3)' },
};

export function JobsTab() {
  const { jobs, addJob, updateJob, currentUser } = useStore();

  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('All');
  const [viewingJobId, setViewingJobId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [formOpen, setFormOpen]     = useState(false);
  const [viewingCandidateId, setViewingCandidateId] = useState(null);
  const [editingCandidateId, setEditingCandidateId] = useState(null);

  const role     = currentUser.role;
  const canAdd   = PERMISSIONS.canAddJob(role);    // t-1 only
  const canEdit  = PERMISSIONS.canEditJob(role);   // t-1 only
  const canDelete= PERMISSIONS.canDeleteJob(role); // t-1 only
  // t-2 can view jobs but cannot add/edit/delete

  const filtered = jobs.filter((j) => {
    if (statusFilter !== 'All' && j.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${j.title} ${j.client} ${j.location || ''} ${(j.requiredSkills || []).join(' ')}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openNew  = () => { setEditingJob(null); setFormOpen(true); };
  const openEdit = (job) => { setEditingJob(job); setFormOpen(true); setViewingJobId(null); };

  const handleSave = (data) => {
    if (editingJob) updateJob(editingJob.id, data);
    else addJob(data);
    setFormOpen(false);
    setEditingJob(null);
  };

  const counts = {
    All:       jobs.length,
    Active:    jobs.filter((j) => j.status === 'Active').length,
    'On Hold': jobs.filter((j) => j.status === 'On Hold').length,
    Filled:    jobs.filter((j) => j.status === 'Filled').length,
    Cancelled: jobs.filter((j) => j.status === 'Cancelled').length,
  };

  return (
    <div className="p-6 space-y-5 max-w-6xl">

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {filtered.length} job order{filtered.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            {counts.Active} active · {counts.Filled} filled
            {role === 't-2' && <span className="ml-2 flex items-center gap-1 inline-flex"><Eye size={10} /> View only</span>}
          </p>
        </div>
        {canAdd && (
          <Button variant="primary" size="sm" icon={Plus} onClick={openNew}>
            New Job Order
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
          <input
            type="text"
            placeholder="Search jobs, clients, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', 'Active', 'On Hold', 'Filled', 'Cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={statusFilter === s ? {
                backgroundColor: 'rgba(6,182,212,0.15)',
                color: 'var(--accent-light)',
                borderColor: 'rgba(6,182,212,0.35)',
              } : {
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                borderColor: 'var(--border-default)',
              }}
            >
              {s} <span style={{ color: 'var(--text-ghost)' }}>({counts[s] ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Job cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <Briefcase size={32} className="mb-3" style={{ color: 'var(--text-ghost)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No job orders found</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>
            {canAdd ? 'Click "New Job Order" to get started.' : 'No active job orders at this time.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => {
            const sc = STATUS_STYLES[job.status] || STATUS_STYLES.Active;
            return (
              <div
                key={job.id}
                className="rounded-xl border flex flex-col transition-all duration-150 cursor-pointer group"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                onClick={() => setViewingJobId(job.id)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setViewingJobId(job.id)}
              >
                {/* Card header */}
                <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                        {job.title}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {job.client}
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-medium border shrink-0"
                      style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-4 py-3 flex-1 space-y-2">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--text-faint)' }}>
                    {job.location && (
                      <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                    )}
                    {job.minExperience > 0 && (
                      <span className="flex items-center gap-1"><Briefcase size={10} />{job.minExperience}+ yrs</span>
                    )}
                    {job.salaryMin && job.salaryMax && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={10} />${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax / 1000).toFixed(0)}k
                      </span>
                    )}
                    {job.remote && (
                      <span className="flex items-center gap-1"><Clock size={10} />{job.remote}</span>
                    )}
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {(job.requiredSkills || []).slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-1.5 py-0.5 rounded text-xs border"
                        style={skill === job.emphasisSkill ? {
                          backgroundColor: 'rgba(6,182,212,0.15)',
                          color: 'var(--accent-light)',
                          borderColor: 'rgba(6,182,212,0.35)',
                        } : {
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--text-muted)',
                          borderColor: 'var(--border-default)',
                        }}
                      >
                        {skill === job.emphasisSkill && '★ '}{skill}
                      </span>
                    ))}
                    {(job.requiredSkills || []).length > 4 && (
                      <span className="px-1.5 py-0.5 text-xs" style={{ color: 'var(--text-ghost)' }}>
                        +{job.requiredSkills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card footer */}
                <div className="px-4 py-2.5 border-t flex items-center justify-between"
                  style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                    {job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : ''}
                  </span>
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(job); }}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-faint)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-light)'; e.currentTarget.style.backgroundColor = 'rgba(6,182,212,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.backgroundColor = ''; }}
                        title="Edit job"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}
                    <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" style={{ color: 'var(--text-ghost)' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job detail slide-over */}
      {viewingJobId && (
        <JobDetail
          jobId={viewingJobId}
          onClose={() => setViewingJobId(null)}
          onEdit={() => openEdit(jobs.find((j) => j.id === viewingJobId))}
          onViewCandidate={(id) => { setViewingCandidateId(id); setViewingJobId(null); }}
        />
      )}

      {/* Candidate detail (opened from job scores) */}
      {viewingCandidateId && (
        <CandidateDetail
          candidateId={viewingCandidateId}
          onClose={() => setViewingCandidateId(null)}
          onEdit={() => { setEditingCandidateId(viewingCandidateId); setViewingCandidateId(null); }}
        />
      )}
      {editingCandidateId && (
        <CandidateForm
          isOpen={!!editingCandidateId}
          onClose={() => setEditingCandidateId(null)}
          editingId={editingCandidateId}
        />
      )}

      {/* Job form */}
      <JobForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingJob(null); }}
        onSave={handleSave}
        editingJob={editingJob}
      />
    </div>
  );
}


