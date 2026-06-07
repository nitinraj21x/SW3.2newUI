import { useState } from 'react';
import {
  X, Mail, Phone, MapPin, Clock, Briefcase, GraduationCap,
  Link2, Edit2, Share2, Target, CheckCircle, AlertCircle, MinusCircle,
  Building2, Calendar,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useStore, { PERMISSIONS } from '../../store/useStore';
import { StatusBadge } from '../ui/Badge';
import { SkillTag } from '../ui/SkillTag';
import { ScoreBar } from './ScoreBar';
import { scoreCandidate, getScoreColor } from '../../utils/scoring';
import { USERS } from '../../data/mockData';
import { Button } from '../ui/Button';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <Icon size={14} style={{ color: 'var(--text-faint)' }} />
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function CandidateDetail({ candidateId, onClose, onEdit }) {
  const { candidates, currentUser, canEditCandidate, shareCandidate, scoringConfig } = useStore();
  const [shareOpen, setShareOpen] = useState(false);

  const candidate = candidates.find((c) => c.id === candidateId);
  if (!candidate) return null;

  const skills      = candidate.skills      || [];
  const workHistory = candidate.workHistory || [];
  const education   = candidate.education   || [];
  const sharedWith  = candidate.sharedWith  || [];

  const canEdit     = canEditCandidate(candidate);
  const addedByUser = USERS.find((u) => u.id === candidate.addedBy);
  const clients     = USERS.filter((u) => u.role === 't-3');

  const hasActiveScoring =
    (scoringConfig?.skills?.length ?? 0) > 0 && !!scoringConfig?.emphasisSkill;
  const scoreResult = hasActiveScoring
    ? scoreCandidate(candidate, scoringConfig)
    : null;

  const generateShareLink = () => {
    const link = `${window.location.origin}/shared/${candidate.id}?token=${btoa(candidate.id)}`;
    navigator.clipboard.writeText(link).catch(() => {});
    alert(`Share link copied:\n${link}\n\n(Contact info hidden for external viewers.)`);
  };

  // Close on Escape key
  const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`${candidate.firstName} ${candidate.lastName} profile`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center gap-4 px-6 py-3 border-b"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {candidate.firstName?.[0]}{candidate.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-xs truncate flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Building2 size={11} />
              {candidate.currentRole}{candidate.currentCompany ? ` · ${candidate.currentCompany}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-2 flex-wrap">
            <StatusBadge status={candidate.status} />
            {scoreResult && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getScoreColor(scoreResult.score)}`}
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                {scoreResult.score}% match
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
          {/* Close button — prominent */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            aria-label="Close profile"
          >
            <X size={15} />
            Close
          </button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column: contact + skills + score ──────────────────── */}
          <div className="space-y-5">

            {/* Contact card */}
            <div className="rounded-xl border p-4 space-y-3"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <Section title="Contact" icon={Mail}>
                <div className="space-y-2.5">
                  {candidate.email && (
                    <a href={`mailto:${candidate.email}`}
                      className="flex items-center gap-2.5 text-sm transition-colors hover:text-cyan-400 group"
                      style={{ color: 'var(--text-secondary)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        <Mail size={13} style={{ color: 'var(--text-faint)' }} />
                      </div>
                      <span className="truncate">{candidate.email}</span>
                    </a>
                  )}
                  {candidate.phone && (
                    <a href={`tel:${candidate.phone}`}
                      className="flex items-center gap-2.5 text-sm transition-colors hover:text-cyan-400"
                      style={{ color: 'var(--text-secondary)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        <Phone size={13} style={{ color: 'var(--text-faint)' }} />
                      </div>
                      {candidate.phone}
                    </a>
                  )}
                  {candidate.location && (
                    <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        <MapPin size={13} style={{ color: 'var(--text-faint)' }} />
                      </div>
                      {candidate.location}
                    </div>
                  )}
                  {candidate.noticePeriod && (
                    <div className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        <Clock size={13} style={{ color: 'var(--text-faint)' }} />
                      </div>
                      Notice: {candidate.noticePeriod}
                    </div>
                  )}
                  {candidate.linkedIn && (
                    <a href={candidate.linkedIn} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        <Link2 size={13} className="text-cyan-400" />
                      </div>
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </Section>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Experience', value: `${candidate.totalExperience || 0} yrs`, icon: Briefcase },
                { label: 'Added by',   value: addedByUser?.name || 'Unknown',          icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl border p-3"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>{label}</p>
                  <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Score breakdown */}
            {scoreResult && (
              <div className="rounded-xl border p-4 space-y-3"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'rgba(6,182,212,0.25)' }}>
                <Section title="Score Breakdown" icon={Target}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Overall</span>
                      <span className={`text-lg font-bold ${getScoreColor(scoreResult.score)}`}>{scoreResult.score}%</span>
                    </div>
                    <ScoreBar score={scoreResult.score} />
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {[
                        { label: 'Emphasis', val: scoreResult.emphasisScore },
                        { label: 'Skills',   val: scoreResult.skillScore },
                        { label: 'Exp',      val: scoreResult.expScore },
                        { label: 'Location', val: scoreResult.locationScore },
                      ].map(({ label, val }) => (
                        <div key={label} className="rounded-lg p-2 text-center border"
                          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                          <p className={`text-sm font-bold ${getScoreColor(val)}`}>{val ?? 0}%</p>
                          <p className="text-xs" style={{ color: 'var(--text-ghost)' }}>{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {(scoreResult.matchDetails || []).map((d) => (
                        <div key={d.skill} className="flex items-center gap-2 text-xs">
                          {d.type === 'exact'    && <CheckCircle size={11} className="text-emerald-400 shrink-0" />}
                          {d.type === 'semantic' && <AlertCircle size={11} className="text-yellow-400 shrink-0" />}
                          {d.type === 'none'     && <MinusCircle size={11} className="shrink-0" style={{ color: 'var(--text-ghost)' }} />}
                          <span style={{ color: d.type === 'none' ? 'var(--text-ghost)' : 'var(--text-secondary)' }}>
                            {d.isEmphasis && <span className="text-yellow-400 mr-1">★</span>}{d.skill}
                          </span>
                          {d.type === 'semantic' && <span style={{ color: 'var(--text-faint)' }}>via {d.matchedVia}</span>}
                          <span className={`ml-auto font-semibold ${getScoreColor(Math.round((d.finalScore ?? 0) * 100))}`}>
                            {Math.round((d.finalScore ?? 0) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {/* Share with client */}
            {PERMISSIONS.canShareCandidate(currentUser.role) && (
              <div className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Share2 size={14} />Share with Client
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-faint)' }}>
                    {sharedWith.length} shared
                  </span>
                </button>
                {shareOpen && (
                  <div className="px-4 pb-4 space-y-2 border-t pt-3"
                    style={{ borderColor: 'var(--border-subtle)' }}>
                    {clients.map((client) => {
                      const isShared = sharedWith.includes(client.id);
                      return (
                        <label key={client.id} className="flex items-center gap-3 cursor-pointer py-1">
                          <input type="checkbox" checked={isShared}
                            onChange={() => shareCandidate(candidate.id, client.id)}
                            className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500" />
                          <span className="text-sm flex-1" style={{ color: 'var(--text-secondary)' }}>{client.name}</span>
                          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{client.email}</span>
                          {isShared && <span className="text-xs text-emerald-500 font-medium">Shared</span>}
                        </label>
                      );
                    })}
                    <button onClick={generateShareLink}
                      className="w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                      <Link2 size={12} />Generate External Link
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Middle + Right columns: skills, work, education, notes ──── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Skills */}
            {skills.length > 0 && (
              <div className="rounded-xl border p-5 space-y-3"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <Section title={`Skills · ${skills.length}`} icon={Target}>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const isTargeted = (scoringConfig?.skills || []).some(
                        (t) => t.toLowerCase() === skill.toLowerCase()
                      );
                      return <SkillTag key={skill} skill={skill} highlight={isTargeted} />;
                    })}
                  </div>
                </Section>
              </div>
            )}

            {/* Work History */}
            {workHistory.length > 0 && (
              <div className="rounded-xl border p-5 space-y-3"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <Section title="Work History" icon={Briefcase}>
                  <div className="space-y-3">
                    {workHistory.map((job, i) => (
                      <div key={i} className="relative pl-4">
                        {/* Timeline line */}
                        {i < workHistory.length - 1 && (
                          <div className="absolute left-1.5 top-5 bottom-0 w-px"
                            style={{ backgroundColor: 'var(--border-default)' }} />
                        )}
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-cyan-500"
                          style={{ backgroundColor: 'var(--bg-surface)' }} />
                        <div className="rounded-lg p-3 border"
                          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{job.role}</p>
                              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{job.company}</p>
                            </div>
                            <span className="text-xs shrink-0 px-2 py-0.5 rounded"
                              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-faint)', border: '1px solid var(--border-default)' }}>
                              {job.from}{job.to ? ` – ${job.to}` : ''}
                            </span>
                          </div>
                          {job.description && (
                            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
                              {job.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="rounded-xl border p-5 space-y-3"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <Section title="Education" icon={GraduationCap}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {education.map((edu, i) => (
                      <div key={i} className="rounded-lg p-3 border"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{edu.degree}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {edu.institution}{edu.year ? ` · ${edu.year}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* Notes */}
            {candidate.notes && (
              <div className="rounded-xl border p-5 space-y-3"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <Section title="Internal Notes" icon={Briefcase}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {candidate.notes}
                  </p>
                </Section>
              </div>
            )}

            {/* Meta footer */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs pb-4" style={{ color: 'var(--text-ghost)' }}>
              {candidate.createdAt && (
                <span>Created {formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}</span>
              )}
              {candidate.updatedAt && (
                <span>Updated {formatDistanceToNow(new Date(candidate.updatedAt), { addSuffix: true })}</span>
              )}
              {sharedWith.length > 0 && (
                <span>
                  Shared with:{' '}
                  {sharedWith.map((id) => USERS.find((u) => u.id === id)?.name).filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

