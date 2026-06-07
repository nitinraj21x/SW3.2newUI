import { getScoreColor, getScoreBarColor } from '../../utils/scoring';

export function ScoreBar({ score, size = 'md' }) {
  if (score === null || score === undefined) {
    return <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>—</span>;
  }

  const textColor = getScoreColor(score);
  const barColor  = getScoreBarColor(score);

  if (size === 'sm') {
    return <span className={`text-xs font-bold ${textColor}`}>{score}%</span>;
  }

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-elevated)' }}
      >
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-bold shrink-0 ${textColor}`}>{score}%</span>
    </div>
  );
}
