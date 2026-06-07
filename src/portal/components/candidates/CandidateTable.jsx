import { useState } from 'react';
import {
  Edit2, Eye, Trash2, ChevronLeft, ChevronRight,
  MapPin, Clock, Building2, CheckSquare, Square,
} from 'lucide-react';
import useStore, { PERMISSIONS } from '../../store/useStore';
import { StatusBadge } from '../ui/Badge';
import { SkillTag } from '../ui/SkillTag';
import { ScoreBar } from './ScoreBar';
import { scoreCandidate } from '../../utils/scoring';
import { USERS } from '../../data/mockData';

const PAGE_SIZE = 10;

export function CandidateTable({ candidates = [], onViewCandidate, onEditCandidate }) {
  const {
    currentUser,
    canEditCandidate,
    deleteCandidate,
    selectedCandidateIds,
    toggleCandidateSelection,
    selectAllCandidates,
    clearCandidateSelection,
    scoringConfig,
  } = useStore();

  const [page, setPage] = useState(1);

  // v2 scoring: needs skills[] + emphasisSkill to be active
  const hasActiveScoring =
    (scoringConfig?.skills?.length ?? 0) > 0 && !!scoringConfig?.emphasisSkill;

  const totalPages = Math.ceil(candidates.length / PAGE_SIZE);
  const paginated  = candidates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allPageSelected =
    paginated.length > 0 && paginated.every((c) => selectedCandidateIds.includes(c.id));

  const togglePageSelection = () => {
    if (allPageSelected) clearCandidateSelection();
    else selectAllCandidates(paginated.map((c) => c.id));
  };

  const getAddedByName = (userId) =>
    USERS.find((u) => u.id === userId)?.name || 'Unknown';

  const handleDelete = (id) => {
    if (window.confirm('Permanently delete this candidate? This cannot be undone.')) {
      deleteCandidate(id);
    }
  };

  const thStyle = {
    color: 'var(--text-faint)',
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border-subtle)',
  };

  if (candidates.length === 0) {
    return (
      <div
        className="rounded-xl flex flex-col items-center justify-center py-16 text-center"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: 'var(--bg-elevated)' }}
        >
          <Eye size={20} style={{ color: 'var(--text-ghost)' }} />
        </div>
        <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No candidates found</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-ghost)' }}>
          Try adjusting your filters or add a new candidate.
        </p>
      </div>
    );
  }

  const headers = [
    'Candidate', 'Skills', 'Exp', 'Location', 'Notice', 'Status',
    ...(hasActiveScoring ? ['Match'] : []),
    'Added By', 'Actions',
  ];

  return (
    <div
      className="rounded-xl overflow-hidden transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="grid" aria-label="Candidates table">
          <thead>
            <tr>
              {PERMISSIONS.canAddCandidate(currentUser.role) && (
                <th className="w-10 px-4 py-3 text-left" style={thStyle}>
                  <button
                    onClick={togglePageSelection}
                    style={{ color: allPageSelected ? 'var(--accent-light)' : 'var(--text-faint)' }}
                    aria-label={allPageSelected ? 'Deselect all' : 'Select all on page'}
                  >
                    {allPageSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                  </button>
                </th>
              )}
              {headers.map((h) => (
                <th
                  key={h}
                  className={[
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
                    h === 'Skills'   ? 'hidden md:table-cell' : '',
                    h === 'Exp'      ? 'hidden lg:table-cell' : '',
                    h === 'Location' ? 'hidden xl:table-cell' : '',
                    h === 'Notice'   ? 'hidden lg:table-cell' : '',
                    h === 'Added By' ? 'hidden xl:table-cell' : '',
                    h === 'Actions'  ? 'text-right'           : '',
                  ].join(' ')}
                  style={thStyle}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginated.map((candidate) => {
              const isSelected  = selectedCandidateIds.includes(candidate.id);
              const canEdit     = canEditCandidate(candidate);
              const scoreResult = hasActiveScoring
                ? scoreCandidate(candidate, scoringConfig)
                : null;

              return (
                <tr
                  key={candidate.id}
                  className="cursor-pointer transition-colors border-b last:border-0"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    backgroundColor: isSelected ? 'rgba(6,182,212,0.05)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? 'rgba(6,182,212,0.05)'
                      : 'transparent';
                  }}
                  onClick={() => onViewCandidate(candidate.id)}
                  role="row"
                >
                  {/* Checkbox */}
                  {PERMISSIONS.canAddCandidate(currentUser.role) && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleCandidateSelection(candidate.id)}
                        style={{ color: isSelected ? 'var(--accent-light)' : 'var(--text-faint)' }}
                        aria-label={`${isSelected ? 'Deselect' : 'Select'} ${candidate.firstName} ${candidate.lastName}`}
                      >
                        {isSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                      </button>
                    </td>
                  )}

                  {/* Name + role */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {candidate.firstName} {candidate.lastName}
                        </p>
                        <p className="text-xs truncate flex items-center gap-1" style={{ color: 'var(--text-faint)' }}>
                          <Building2 size={10} />{candidate.currentRole}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Skills */}
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(candidate.skills || []).slice(0, 3).map((skill) => (
                        <SkillTag key={skill} skill={skill} />
                      ))}
                      {(candidate.skills || []).length > 3 && (
                        <span
                          className="px-1.5 py-0.5 text-xs rounded border"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            color: 'var(--text-faint)',
                            borderColor: 'var(--border-default)',
                          }}
                        >
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Experience */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {candidate.totalExperience}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-ghost)' }}> yrs</span>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <MapPin size={10} className="shrink-0" />{candidate.location}
                    </span>
                  </td>

                  {/* Notice */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={10} className="shrink-0" />{candidate.noticePeriod}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={candidate.status} />
                  </td>

                  {/* Score (only when scoring is active) */}
                  {hasActiveScoring && (
                    <td className="px-4 py-3 w-32">
                      <ScoreBar score={scoreResult?.score} />
                    </td>
                  )}

                  {/* Added by */}
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {getAddedByName(candidate.addedBy)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => onViewCandidate(candidate.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--text-faint)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-faint)'; }}
                        title="View profile"
                      >
                        <Eye size={14} />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => onEditCandidate(candidate.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--text-faint)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(6,182,212,0.1)'; e.currentTarget.style.color = 'var(--accent-light)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-faint)'; }}
                          title="Edit profile"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {currentUser.role === 't-1' && (
                        <button
                          onClick={() => handleDelete(candidate.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--text-faint)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-faint)'; }}
                          title="Delete candidate"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="px-4 py-3 flex items-center justify-between border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, candidates.length)} of {candidates.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => { if (page > 1) { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-faint)'; }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-7 h-7 rounded-lg text-xs font-medium transition-colors"
                style={p === page ? { backgroundColor: 'var(--accent)', color: '#fff' } : { color: 'var(--text-faint)' }}
                onMouseEnter={(e) => { if (p !== page) { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                onMouseLeave={(e) => { if (p !== page) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-faint)'; } }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-faint)' }}
              onMouseEnter={(e) => { if (page < totalPages) { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-faint)'; }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

