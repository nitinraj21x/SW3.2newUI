import { useState, useMemo } from 'react';
import { Shield, Search, Filter, UserPlus, Edit3, Trash2, FileText, Share2, Mail, TrendingUp, Lock, CalendarDays } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import useStore from '../../store/useStore';
import { USERS } from '../../data/mockData';

const ACTION_META = {
  CANDIDATE_ADDED:   { label: 'Candidate Added',   icon: UserPlus,     color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  CANDIDATE_EDITED:  { label: 'Candidate Edited',  icon: Edit3,        color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  CANDIDATE_DELETED: { label: 'Candidate Deleted', icon: Trash2,       color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  RESUME_UPLOADED:   { label: 'Resume Uploaded',   icon: FileText,     color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
  PROFILE_SHARED:    { label: 'Profile Shared',    icon: Share2,       color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20' },
  BULK_EMAIL_SENT:   { label: 'Bulk Email Sent',   icon: Mail,         color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
  ACCESS_CHANGED:    { label: 'Access Changed',    icon: Lock,         color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/20' },
  DATA_EXPORTED:     { label: 'Data Exported',     icon: TrendingUp,   color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20' },
  EVENT_ADDED:       { label: 'Event Added',       icon: CalendarDays, color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
  EVENT_EDITED:      { label: 'Event Edited',      icon: CalendarDays, color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
  EVENT_DELETED:     { label: 'Event Deleted',     icon: CalendarDays, color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
};

const ACTION_TYPES = ['All', ...Object.keys(ACTION_META)];

const selectStyle = {
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-primary)',
};

export function AuditTab() {
  const { auditLogs } = useStore();
  const [search, setSearch]           = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [userFilter, setUserFilter]   = useState('All');

  const filtered = useMemo(() => {
    return auditLogs.filter((log) => {
      if (actionFilter !== 'All' && log.action !== actionFilter) return false;
      if (userFilter  !== 'All' && log.userId  !== userFilter)  return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${log.userName} ${log.targetName || ''} ${log.detail}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [auditLogs, search, actionFilter, userFilter]);

  return (
    <div className="p-6 space-y-5 max-w-5xl">

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Shield size={18} className="text-orange-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Compliance Audit Ledger</h2>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Read-only chronological record of all system actions</p>
        </div>
        <div className="ml-auto">
          <span className="px-2.5 py-1 rounded-lg text-xs border"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
            {filtered.length} entries
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl p-4 space-y-3 transition-colors duration-200"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: 'var(--text-faint)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              style={selectStyle}
              aria-label="Search audit logs"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            style={selectStyle}
            aria-label="Filter by action type"
          >
            {ACTION_TYPES.map((a) => (
              <option key={a} value={a}>{a === 'All' ? 'All Actions' : ACTION_META[a]?.label || a}</option>
            ))}
          </select>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            style={selectStyle}
            aria-label="Filter by user"
          >
            <option value="All">All Users</option>
            {USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>

      {/* Log list */}
      <div className="rounded-xl overflow-hidden transition-colors duration-200"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Shield size={32} className="mb-3" style={{ color: 'var(--text-ghost)' }} />
            <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No audit entries match your filters.</p>
          </div>
        ) : (
          <div>
            {filtered.map((log, idx) => {
              const meta = ACTION_META[log.action] || { label: log.action, icon: Shield, color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20' };
              const Icon = meta.icon;
              return (
                <div
                  key={log.id}
                  className="px-5 py-4 flex items-start gap-4 border-b last:border-0 transition-colors"
                  style={{ borderColor: 'var(--border-subtle)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                  role="row"
                >
                  <span className="text-xs font-mono w-8 shrink-0 pt-0.5 text-right" style={{ color: 'var(--text-ghost)' }}>
                    {filtered.length - idx}
                  </span>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon size={14} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                      {log.targetName && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→ {log.targetName}</span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{log.detail}</p>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-ghost)' }}>
                      <span className="font-medium" style={{ color: 'var(--text-faint)' }}>{log.userName}</span>
                      <span>·</span>
                      <span title={format(new Date(log.timestamp), 'PPpp')}>
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </span>
                      <span>·</span>
                      <span className="font-mono">{format(new Date(log.timestamp), 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ACTION_META).slice(0, 4).map(([action, meta]) => {
          const count = auditLogs.filter((l) => l.action === action).length;
          const Icon  = meta.icon;
          return (
            <div key={action} className="rounded-xl p-3 flex items-center gap-3 transition-colors duration-200"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.bg}`}>
                <Icon size={14} className={meta.color} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{count}</p>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{meta.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


