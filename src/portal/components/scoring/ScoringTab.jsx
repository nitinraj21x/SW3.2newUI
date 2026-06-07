import { useState, useMemo, useEffect } from 'react';
import {
  Zap, Star, Sliders, ChevronDown, ChevronUp, BookOpen,
  X, CheckCircle, AlertCircle, MinusCircle, MapPin, Clock,
  Briefcase, RotateCcw, TrendingUp,
} from 'lucide-react';
import { CandidateDetail } from '../candidates/CandidateDetail';
import useStore from '../../store/useStore';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { ScoringInstructions } from './ScoringInstructions';
import { SkillPicker } from './SkillPicker';
import {
  SCORING_PRESETS, DEFAULT_SCORING_CONFIG,
  rankCandidates, getScoreColor, getScoreBarColor,
} from '../../utils/scoring';

// ─── Strictness config ────────────────────────────────────────────────────────
const STRICTNESS_LEVELS = [
  { max: 20,  label: 'Very Lenient', color: 'text-emerald-400', barColor: '#10b981', desc: 'Partial matches score nearly as high as exact matches' },
  { max: 40,  label: 'Lenient',      color: 'text-emerald-400', barColor: '#10b981', desc: 'Missing skills cause mild score reduction' },
  { max: 60,  label: 'Balanced',     color: 'text-yellow-400',  barColor: '#f59e0b', desc: 'Standard weighting — recommended for most roles' },
  { max: 80,  label: 'Strict',       color: 'text-orange-400',  barColor: '#f97316', desc: 'Missing skills significantly lower the score' },
  { max: 100, label: 'Very Strict',  color: 'text-red-400',     barColor: '#ef4444', desc: 'Candidates must match almost all skills to score well' },
];
function getStrictnessLevel(v) {
  return STRICTNESS_LEVELS.find((l) => v <= l.max) || STRICTNESS_LEVELS[4];
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, rank }) {
  const color = getScoreColor(score);
  const bar   = getScoreBarColor(score);
  const top3  = rank <= 3;
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0 w-14">
      {top3 && (
        <span className="text-xs font-bold" style={{ color: 'var(--accent-light)' }}>#{rank}</span>
      )}
      {!top3 && (
        <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>#{rank}</span>
      )}
      <div className={`text-lg font-bold leading-none ${color}`}>{score}%</div>
      <div className="w-10 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        <div className={`h-full ${bar} rounded-full`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

// ─── Result row ───────────────────────────────────────────────────────────────
function ResultRow({ rank, candidate, result, onView }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border transition-all duration-150"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: expanded ? 'rgba(6,182,212,0.3)' : 'var(--border-subtle)' }}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}>
        <ScoreRing score={result.score} rank={rank} />
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {candidate.firstName?.[0]}{candidate.lastName?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {candidate.firstName} {candidate.lastName}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
            {candidate.currentRole} · {candidate.totalExperience} yrs
          </p>
          {/* Mini skill match pills */}
          <div className="flex flex-wrap gap-1 mt-1">
            {(result.matchDetails || []).slice(0, 4).map((d) => (
              <span key={d.skill} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs border"
                style={d.type === 'exact'
                  ? { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)', color: '#34d399' }
                  : d.type === 'semantic'
                  ? { backgroundColor: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.25)', color: '#fbbf24' }
                  : { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-ghost)' }
                }>
                {d.isEmphasis && '★ '}{d.skill}
              </span>
            ))}
            {(result.matchDetails || []).length > 4 && (
              <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>
                +{result.matchDetails.length - 4}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onView(candidate.id); }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors hidden sm:block"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; e.currentTarget.style.color = 'var(--accent-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            View
          </button>
          {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-faint)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-faint)' }} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t pt-3 space-y-3" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Sub-score grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Emphasis',   val: result.emphasisScore,  color: 'text-yellow-400' },
              { label: 'Skills',     val: result.skillScore,     color: 'text-cyan-400' },
              { label: 'Experience', val: result.expScore,       color: 'text-emerald-400' },
              { label: 'Location',   val: result.locationScore,  color: 'text-sky-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="rounded-lg p-2 text-center border"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
                <p className={`text-base font-bold ${color}`}>{val ?? 0}%</p>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</p>
              </div>
            ))}
          </div>
          {/* Per-skill breakdown */}
          <div className="space-y-1.5">
            {(result.matchDetails || []).map((d) => (
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
          {/* Quick info */}
          <div className="flex flex-wrap gap-3 text-xs pt-1" style={{ color: 'var(--text-faint)' }}>
            <span className="flex items-center gap-1"><MapPin size={10} />{candidate.location}</span>
            <span className="flex items-center gap-1"><Clock size={10} />{candidate.noticePeriod}</span>
            <span className="flex items-center gap-1"><Briefcase size={10} />{candidate.totalExperience} yrs exp</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────
export function ScoringTab() {
  const { scoringConfig, setScoringConfig, resetScoringConfig, getVisibleCandidates } = useStore();
  const candidates = getVisibleCandidates();

  const [showInstructions, setShowInstructions] = useState(true);
  const [showAdvanced, setShowAdvanced]         = useState(false);
  const [viewingCandidateId, setViewingCandidateId] = useState(null);

  // Local draft — syncs from store on mount and when store changes externally
  const [cfg, setCfg] = useState(() => ({ ...DEFAULT_SCORING_CONFIG, ...scoringConfig }));

  // Re-sync local draft if store config changes from outside (e.g. Jobs tab)
  useEffect(() => {
    setCfg({ ...DEFAULT_SCORING_CONFIG, ...scoringConfig });
  }, [scoringConfig]);

  const set = (field, value) => setCfg((c) => ({ ...c, [field]: value, preset: field === 'preset' ? value : '' }));

  const sl = getStrictnessLevel(cfg.strictness);
  const isConfigured = cfg.skills.length > 0 && !!cfg.emphasisSkill;

  const applyPreset = (presetId) => {
    const preset = SCORING_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setCfg({ ...DEFAULT_SCORING_CONFIG, ...preset.config, preset: presetId });
  };

  const handleApply = () => setScoringConfig({ ...cfg });

  const handleReset = () => {
    const fresh = { ...DEFAULT_SCORING_CONFIG };
    setCfg(fresh);
    resetScoringConfig();
  };

  // Live results — recompute whenever cfg changes (not just after Apply)
  const ranked = useMemo(
    () => (cfg.skills.length > 0 && cfg.emphasisSkill ? rankCandidates(candidates, cfg) : []),
    [candidates, cfg]
  );

  const isDirty = JSON.stringify(cfg) !== JSON.stringify({ ...DEFAULT_SCORING_CONFIG, ...scoringConfig });

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-0" style={{ height: 'calc(100vh - 4rem)' }}>

      {/* ── Left config panel ──────────────────────────────────────────────── */}
      <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 overflow-y-auto border-r"
        style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="p-5 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Scoring System</h2>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Configure candidate ranking criteria</p>
            </div>
            <div className="flex items-center gap-2">
              {isDirty && (
                <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                  Unsaved
                </span>
              )}
              <button onClick={() => setShowInstructions(!showInstructions)}
                className="p-1.5 rounded-lg border transition-colors"
                style={showInstructions
                  ? { backgroundColor: 'rgba(6,182,212,0.15)', borderColor: 'rgba(6,182,212,0.35)', color: 'var(--accent-light)' }
                  : { backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-faint)' }}
                title={showInstructions ? 'Hide guide' : 'Show guide'}>
                <BookOpen size={13} />
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="rounded-xl border p-3 space-y-2"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Quick Presets</p>
            <div className="grid grid-cols-2 gap-1.5">
              {SCORING_PRESETS.map((preset) => (
                <button key={preset.id} onClick={() => applyPreset(preset.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all"
                  style={cfg.preset === preset.id ? {
                    backgroundColor: 'rgba(6,182,212,0.15)', borderColor: 'rgba(6,182,212,0.4)',
                  } : { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
                  onMouseEnter={(e) => { if (cfg.preset !== preset.id) e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; }}
                  onMouseLeave={(e) => { if (cfg.preset !== preset.id) e.currentTarget.style.borderColor = 'var(--border-default)'; }}>
                  <span className="text-sm shrink-0">{preset.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate"
                      style={{ color: cfg.preset === preset.id ? 'var(--accent-light)' : 'var(--text-secondary)' }}>
                      {preset.label}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-ghost)' }}>{preset.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Skills picker */}
          <div className="rounded-xl border p-3 space-y-3"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: cfg.skills.length > 0 ? 'rgba(6,182,212,0.3)' : 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-cyan-500/15 flex items-center justify-center shrink-0">
                <Zap size={11} className="text-cyan-400" />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Required Skills
                {cfg.skills.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-cyan-400">{cfg.skills.length} selected</span>
                )}
              </p>
            </div>
            <SkillPicker
              selected={cfg.skills}
              onChange={(skills) => set('skills', skills)}
              emphasisSkill={cfg.emphasisSkill}
              onEmphasisChange={(s) => set('emphasisSkill', s)}
            />
          </div>

          {/* Emphasis skill */}
          <div className="rounded-xl border p-3 space-y-2"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: cfg.emphasisSkill ? 'rgba(234,179,8,0.4)' : 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-yellow-500/15 flex items-center justify-center shrink-0">
                <Star size={11} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Primary Skill</p>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Click a selected skill to mark it as the emphasis (35% weight)</p>
              </div>
            </div>
            {cfg.skills.length === 0 ? (
              <p className="text-xs italic" style={{ color: 'var(--text-ghost)' }}>Select skills above first</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {cfg.skills.map((skill) => {
                  const isEm = cfg.emphasisSkill === skill;
                  return (
                    <button key={skill} onClick={() => set('emphasisSkill', isEm ? '' : skill)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
                      style={isEm ? {
                        backgroundColor: 'rgba(234,179,8,0.15)', borderColor: 'rgba(234,179,8,0.4)', color: '#fbbf24',
                      } : { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => { if (!isEm) { e.currentTarget.style.backgroundColor = 'rgba(234,179,8,0.08)'; e.currentTarget.style.borderColor = 'rgba(234,179,8,0.3)'; e.currentTarget.style.color = '#fbbf24'; } }}
                      onMouseLeave={(e) => { if (!isEm) { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; } }}>
                      {isEm && <Star size={10} className="text-yellow-400" />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Other factors */}
          <div className="rounded-xl border p-3 space-y-3"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Sliders size={11} className="text-emerald-400" />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Other Factors
                <span className="ml-1 text-xs font-normal" style={{ color: 'var(--text-ghost)' }}>optional</span>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <Input label="Min Experience (years)" type="number" min="0" max="30"
                value={cfg.minExperience} onChange={(e) => set('minExperience', Number(e.target.value))} placeholder="e.g. 4" />
              <Input label="Preferred Location" value={cfg.preferredLocation}
                onChange={(e) => set('preferredLocation', e.target.value)} placeholder="e.g. San Francisco" hint="Partial match — city or state" />
              <Select label="Notice Period" value={cfg.noticePeriod} onChange={(e) => set('noticePeriod', e.target.value)}>
                {['Any', 'Immediate', '2 weeks', '1 month', '3 months'].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </div>
          </div>

          {/* Strictness */}
          <div className="rounded-xl border p-3 space-y-3"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-purple-500/15 flex items-center justify-center shrink-0">
                  <TrendingUp size={11} className="text-purple-400" />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Strictness</p>
              </div>
              <span className={`text-xs font-bold ${sl.color}`}>{sl.label} ({cfg.strictness})</span>
            </div>
            <input type="range" min="0" max="100" step="5" value={cfg.strictness}
              onChange={(e) => set('strictness', Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: sl.barColor }} />
            <div className="flex gap-0.5">
              {[0,20,40,60,80,100].map((v) => (
                <div key={v} className="flex-1 h-1 rounded-full transition-all"
                  style={{ backgroundColor: cfg.strictness >= v ? sl.barColor : 'var(--bg-elevated)' }} />
              ))}
            </div>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{sl.desc}</p>
          </div>

          {/* Advanced weights */}
          <div className="rounded-xl border transition-colors" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Advanced Weights</p>
                {Object.keys(cfg.skillWeights).length > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {Object.keys(cfg.skillWeights).length} overrides
                  </span>
                )}
              </div>
              {showAdvanced ? <ChevronUp size={13} style={{ color: 'var(--text-faint)' }} /> : <ChevronDown size={13} style={{ color: 'var(--text-faint)' }} />}
            </button>
            {showAdvanced && (
              <div className="px-3 pb-3 border-t pt-3 space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                  Per-skill multipliers: 1.0× = default · 2.0× = twice as important · 0.5× = half weight
                </p>
                {cfg.skills.length === 0 ? (
                  <p className="text-xs italic" style={{ color: 'var(--text-ghost)' }}>Add skills first</p>
                ) : cfg.skills.map((skill) => {
                  const w = cfg.skillWeights[skill] ?? 1.0;
                  return (
                    <div key={skill} className="flex items-center gap-2">
                      <span className="text-xs font-medium w-28 truncate shrink-0"
                        style={{ color: skill === cfg.emphasisSkill ? '#fbbf24' : 'var(--text-secondary)' }}>
                        {skill === cfg.emphasisSkill && '★ '}{skill}
                      </span>
                      <input type="range" min="0.5" max="2.0" step="0.1" value={w}
                        onChange={(e) => set('skillWeights', { ...cfg.skillWeights, [skill]: Number(e.target.value) })}
                        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                      <span className="text-xs font-bold w-8 text-right shrink-0"
                        style={{ color: w > 1 ? 'var(--accent-light)' : w < 1 ? '#f87171' : 'var(--text-faint)' }}>
                        {w.toFixed(1)}×
                      </span>
                      {w !== 1.0 && (
                        <button onClick={() => { const u = { ...cfg.skillWeights }; delete u[skill]; set('skillWeights', u); }}
                          className="hover:text-red-400 transition-colors" style={{ color: 'var(--text-ghost)' }}>
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-2">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors shrink-0"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}>
              <RotateCcw size={11} /> Reset
            </button>
            <Button variant="primary" icon={Zap} onClick={handleApply}
              disabled={!isConfigured} className="flex-1 justify-center">
              {!cfg.emphasisSkill && cfg.skills.length > 0
                ? 'Select a Primary Skill'
                : cfg.skills.length === 0
                ? 'Select Skills to Score'
                : `Apply & Score ${candidates.length} Candidates`}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Right: Results + Instructions ──────────────────────────────────── */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {showInstructions && ranked.length === 0 ? (
          <div className="p-5 max-w-lg">
            <ScoringInstructions onClose={() => setShowInstructions(false)} />
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Results header */}
            {ranked.length > 0 && (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Ranked Results
                    {isDirty && <span className="ml-2 text-xs font-normal text-cyan-400">(preview — click Apply to save)</span>}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                    {ranked.length} candidates · sorted by match %
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-faint)' }}>
                  <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-400" /> Exact</span>
                  <span className="flex items-center gap-1"><AlertCircle size={10} className="text-yellow-400" /> Semantic</span>
                  <span className="flex items-center gap-1"><MinusCircle size={10} style={{ color: 'var(--text-ghost)' }} /> Missing</span>
                </div>
              </div>
            )}

            {/* Empty state */}
            {ranked.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
                  <Zap size={24} className="text-cyan-400" />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {cfg.skills.length === 0
                    ? 'Select skills to start scoring'
                    : !cfg.emphasisSkill
                    ? 'Select a primary skill to score'
                    : 'Click Apply to run scoring'}
                </p>
                <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--text-faint)' }}>
                  Use the panel on the left to configure your requirements, then candidates will be ranked here.
                </p>
                {!showInstructions && (
                  <button onClick={() => setShowInstructions(true)}
                    className="mt-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
                    <BookOpen size={12} /> Show Guide
                  </button>
                )}
              </div>
            )}

            {/* Result rows */}
            <div className="space-y-2">
              {ranked.map(({ candidate, result }, idx) => (
                <ResultRow key={candidate.id} rank={idx + 1} candidate={candidate}
                  result={result} onView={setViewingCandidateId} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Candidate detail slide-over */}
      {viewingCandidateId && (
        <CandidateDetail
          candidateId={viewingCandidateId}
          onClose={() => setViewingCandidateId(null)}
          onEdit={() => setViewingCandidateId(null)}
        />
      )}
    </div>
  );
}

