import { Users, Briefcase, FileText, TrendingUp, Clock, UserPlus, Edit3, Share2, Mail, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useStore from '../../store/useStore';
import { StatusBadge } from '../ui/Badge';

const ACTION_ICONS = {
  CANDIDATE_ADDED:   { icon: UserPlus,   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  CANDIDATE_EDITED:  { icon: Edit3,      color: 'text-blue-400',    bg: 'bg-blue-500/10' },
  CANDIDATE_DELETED: { icon: Users,      color: 'text-red-400',     bg: 'bg-red-500/10' },
  RESUME_UPLOADED:   { icon: FileText,   color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  PROFILE_SHARED:    { icon: Share2,     color: 'text-cyan-400',  bg: 'bg-cyan-500/10' },
  BULK_EMAIL_SENT:   { icon: Mail,       color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
  ACCESS_CHANGED:    { icon: Shield,     color: 'text-orange-400',  bg: 'bg-orange-500/10' },
  DATA_EXPORTED:     { icon: TrendingUp, color: 'text-sky-400',     bg: 'bg-sky-500/10' },
};

const card = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
};

function StatCard({ label, value, icon: Icon, colorClass, delta, accent }) {
  return (
    <div
      className="rounded-xl p-5 flex items-start gap-4 transition-colors duration-200 relative overflow-hidden"
      style={{
        ...card,
        borderTop: accent ? '2px solid var(--accent)' : card.border,
      }}
    >
      {/* Subtle background glow for accented card */}
      {accent && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, rgba(6,182,212,0.06) 0%, transparent 60%)' }} />
      )}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0 relative">
        <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
        <p className="text-xs mt-0.5 uppercase tracking-wider font-medium" style={{ color: 'var(--text-faint)' }}>{label}</p>
        {delta !== undefined && delta > 0 && (
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <span>↑</span> {delta} this month
          </p>
        )}
      </div>
    </div>
  );
}

export function OverviewTab() {
  // Defensive defaults — guards against stale localStorage data on first render
  const { candidates = [], auditLogs = [], jobs = [] } = useStore();

  const activeCount       = candidates.filter((c) => c.status === 'Active').length;
  const interviewingCount = candidates.filter((c) => c.status === 'Interviewing').length;
  const placedCount       = candidates.filter((c) => c.status === 'Placed').length;
  const inactiveCount     = candidates.filter((c) => c.status === 'Inactive').length;
  const activeJobs        = jobs.filter((j) => j.status === 'Active').length;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const resumesThisMonth = auditLogs.filter(
    (l) => l.action === 'RESUME_UPLOADED' && new Date(l.timestamp) >= thisMonth
  ).length;
  const addedThisMonth = auditLogs.filter(
    (l) => l.action === 'CANDIDATE_ADDED' && new Date(l.timestamp) >= thisMonth
  ).length;

  const recentLogs = auditLogs.slice(0, 10);

  return (
    <div className="p-6 space-y-6 max-w-6xl">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Candidates"      value={candidates.length} icon={Users}      colorClass="bg-cyan-500/10 text-cyan-400"    delta={addedThisMonth} accent />
        <StatCard label="Active Job Orders"      value={activeJobs}        icon={Briefcase}  colorClass="bg-emerald-500/10 text-emerald-400" />
        <StatCard label="Resumes Parsed (Month)" value={resumesThisMonth}  icon={FileText}   colorClass="bg-violet-500/10 text-violet-400" />
        <StatCard label="Interviewing"           value={interviewingCount} icon={TrendingUp} colorClass="bg-amber-500/10 text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Feed */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden transition-colors duration-200" style={card}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <Clock size={16} style={{ color: 'var(--text-faint)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Recent Activity</h2>
          </div>
          <div>
            {recentLogs.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--text-faint)' }}>No activity yet.</p>
            ) : recentLogs.map((log) => {
              const meta = ACTION_ICONS[log.action] || { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-500/10' };
              const Icon = meta.icon;
              return (
                <div key={log.id} className="px-5 py-3.5 flex items-start gap-3 border-b last:border-0 transition-colors"
                  style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${meta.bg}`}>
                    <Icon size={13} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{log.userName}</span>
                      {' — '}
                      <span style={{ color: 'var(--text-muted)' }}>{log.detail}</span>
                    </p>
                    {log.targetName && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Target: {log.targetName}</p>
                    )}
                  </div>
                  <span className="text-xs shrink-0 mt-0.5" style={{ color: 'var(--text-ghost)' }}>
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Job Orders */}
        <div className="rounded-xl overflow-hidden transition-colors duration-200" style={card}>
          <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <Briefcase size={16} style={{ color: 'var(--text-faint)' }} />
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Active Job Orders</h2>
          </div>
          <div>
            {jobs.filter((j) => j.status === 'Active').length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--text-faint)' }}>No active jobs.</p>
            ) : jobs.filter((j) => j.status === 'Active').map((job) => (
              <div key={job.id} className="px-5 py-3.5 space-y-1.5 border-b last:border-0"
                style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight" style={{ color: 'var(--text-secondary)' }}>{job.title}</p>
                  <StatusBadge status={job.status} />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{job.client}</p>
                <div className="flex flex-wrap gap-1">
                  {(job.requiredSkills || []).slice(0, 3).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 text-xs rounded border"
                      style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', borderColor: 'var(--border-default)' }}>
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                  {job.minExperience ? `${job.minExperience}+ yrs exp required` : 'Experience flexible'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Pipeline */}
      <div className="rounded-xl p-5 transition-colors duration-200" style={card}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Candidate Pipeline</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active',       count: activeCount,       color: 'bg-emerald-500' },
            { label: 'Interviewing', count: interviewingCount, color: 'bg-amber-500' },
            { label: 'Placed',       count: placedCount,       color: 'bg-cyan-500' },
            { label: 'Inactive',     count: inactiveCount,     color: 'bg-slate-500' },
          ].map(({ label, count, color }) => {
            const pct = candidates.length > 0 ? Math.round((count / candidates.length) * 100) : 0;
            return (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{count}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                  <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

