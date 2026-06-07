import { useMemo } from 'react';
import { CheckCircle, AlertCircle, MinusCircle, MapPin, Clock, Briefcase } from 'lucide-react';
import { rankCandidates, getScoreColor, getScoreBarColor } from '../../utils/scoring';
import { SkillTag } from '../ui/SkillTag';

function ScoreRing({ score }) {
  const color = getScoreColor(score);
  const bar   = getScoreBarColor(score);
  return (
    <div className="flex flex-col items-center justify-center w-14 shrink-0">
      <div className={`text-xl font-bold ${color}`}>{score}</div>
      <div className="w-12 h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        <div className={`h-full ${bar} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--text-ghost)' }}>/ 100</div>
    </div>
  );
}

export function JobCandidateList({ job, candidates, onViewCandidate }) {
  const config = useMemo(() => ({
    skills:            job.requiredSkills || [],
    emphasisSkill:     job.emphasisSkill  || '',
    minExperience:     job.minExperience  || 0,
    preferredLocation: job.location       || '',
    noticePeriod:      job.noticePeriod   || 'Any',
    strictness:        50,
    skillWeights:      {},
  }), [job]);

  const ranked = useMemo(() => rankCandidates(candidates, config), [candidates, config]);

  if (ranked.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>No candidates to score yet.</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-ghost)' }}>Add candidates to see match scores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ranked.map(({ candidate, result }, idx) => (
        <button
          key={candidate.id}
          onClick={() => onViewCandidate(candidate.id)}
          className="w-full text-left rounded-xl p-4 border transition-all duration-150 hover:border-cyan-500/40"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex items-start gap-4">
            {/* Rank */}
            <div className="w-6 shrink-0 text-center">
              <span className="text-xs font-bold" style={{ color: idx < 3 ? 'var(--accent-light)' : 'var(--text-ghost)' }}>
                #{idx + 1}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {candidate.firstName[0]}{candidate.lastName[0]}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {candidate.firstName} {candidate.lastName}
                </p>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  <Briefcase size={10} className="inline mr-1" />{candidate.currentRole}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-faint)' }}>
                <span><MapPin size={10} className="inline mr-0.5" />{candidate.location}</span>
                <span><Clock size={10} className="inline mr-0.5" />{candidate.noticePeriod}</span>
                <span>{candidate.totalExperience} yrs exp</span>
              </div>

              {/* Skill match pills */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                {result.matchDetails.slice(0, 6).map((d) => (
                  <span
                    key={d.skill}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border"
                    style={d.type === 'exact'
                      ? { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }
                      : d.type === 'semantic'
                      ? { backgroundColor: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.3)', color: '#fbbf24' }
                      : { backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-ghost)' }
                    }
                  >
                    {d.type === 'exact'    && <CheckCircle size={9} />}
                    {d.type === 'semantic' && <AlertCircle size={9} />}
                    {d.type === 'none'     && <MinusCircle size={9} />}
                    {d.isEmphasis ? <strong>{d.skill}</strong> : d.skill}
                  </span>
                ))}
                {result.matchDetails.length > 6 && (
                  <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>+{result.matchDetails.length - 6} more</span>
                )}
              </div>
            </div>

            {/* Score */}
            <ScoreRing score={result.score} />
          </div>
        </button>
      ))}

      <p className="text-xs text-center pt-2" style={{ color: 'var(--text-ghost)' }}>
        Scored {ranked.length} candidate{ranked.length !== 1 ? 's' : ''} · Click any row to view full profile
      </p>
    </div>
  );
}

