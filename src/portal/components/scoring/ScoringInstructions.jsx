import { X, BookOpen, Star, Sliders, Zap, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    icon: BookOpen,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    title: '1. Select Skills',
    body: 'Choose all the programming languages and technologies required for the role. These form the scoring pool. You can type any skill and press Enter to add it.',
  },
  {
    icon: Star,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    title: '2. Set Emphasis Skill',
    body: 'Pick one skill from your list as the primary requirement. This skill carries 35% of the total score weight — candidates without it will score significantly lower.',
  },
  {
    icon: Sliders,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    title: '3. Other Factors (Optional)',
    body: 'Add experience requirements, preferred location, and notice period. These contribute up to 30% of the total score and help filter candidates by availability.',
  },
  {
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    title: '4. Presets & Strictness',
    body: 'Use a preset (MERN, DevOps, ML, etc.) to auto-fill a common configuration. The strictness slider controls how harshly missing skills penalise the score — high strictness means candidates must match closely.',
  },
  {
    icon: ChevronRight,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    title: '5. Fine-tune Weights',
    body: 'Expand the Advanced Weights section to set per-skill multipliers (0.5×–2×). This lets you say "AWS is twice as important as Linux" within the same job requirement.',
  },
];

export function ScoringInstructions({ onClose }) {
  return (
    <div
      className="rounded-xl border h-full flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-cyan-400" />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>How Scoring Works</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
          aria-label="Close instructions"
        >
          <X size={14} />
        </button>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {STEPS.map(({ icon: Icon, color, bg, title, body }) => (
          <div key={title} className="flex gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${bg}`}>
              <Icon size={14} className={color} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{title}</p>
              <p className="text-xs leading-relaxed mt-0.5" style={{ color: 'var(--text-muted)' }}>{body}</p>
            </div>
          </div>
        ))}

        {/* Weight breakdown */}
        <div className="rounded-xl border p-4 space-y-3 mt-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Score Breakdown</p>
          {[
            { label: 'Emphasis Skill',  pct: '35%', color: 'bg-cyan-500' },
            { label: 'Other Skills',    pct: '35%', color: 'bg-purple-500' },
            { label: 'Experience',      pct: '20%', color: 'bg-emerald-500' },
            { label: 'Location',        pct: '5%',  color: 'bg-sky-500' },
            { label: 'Notice Period',   pct: '5%',  color: 'bg-yellow-500' },
          ].map(({ label, pct, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
              <span className="text-xs flex-1" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{pct}</span>
            </div>
          ))}
          <p className="text-xs pt-1" style={{ color: 'var(--text-ghost)' }}>
            Location and Notice Period weights are redistributed to Skills and Experience when not set.
          </p>
        </div>

        {/* Semantic note */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.2)' }}>
          <p className="text-xs font-semibold text-cyan-400 mb-1">Semantic Matching</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            The engine understands skill relationships. If you require <strong className="text-cyan-300">React</strong> and a candidate has <strong className="text-cyan-300">Next.js</strong> or <strong className="text-cyan-300">Vue</strong>, they receive partial credit — not zero. Related skills are weighted at ~65% of a direct match.
          </p>
        </div>
      </div>
    </div>
  );
}

