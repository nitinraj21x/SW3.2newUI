/**
 * ─── CandidatePortal Scoring Engine v2 ───────────────────────────────────────
 *
 * Scoring config shape:
 * {
 *   skills:          string[]          // all required skills
 *   emphasisSkill:   string            // single primary skill (must be in skills[])
 *   minExperience:   number            // years
 *   preferredLocation: string          // optional
 *   noticePeriod:    string            // optional ('Immediate'|'2 weeks'|'1 month'|'3 months'|'Any')
 *   strictness:      number            // 0–100 (0=lenient, 100=strict)
 *   skillWeights:    Record<string,number>  // per-skill manual weight overrides (0–2)
 *   preset:          string            // preset id or ''
 * }
 *
 * Final score breakdown (weights sum to 1.0):
 *   emphasisSkill   → 35%  (boosted by strictness)
 *   otherSkills     → 35%  (reduced by strictness if missing)
 *   experience      → 20%
 *   location        → 5%   (optional)
 *   noticePeriod    → 5%   (optional)
 */

import { SKILL_ECOSYSTEM } from '../data/mockData';

// ─── Presets ──────────────────────────────────────────────────────────────────
export const SCORING_PRESETS = [
  {
    id: 'mern',
    label: 'MERN Stack',
    description: 'MongoDB · Express · React · Node.js',
    icon: '⚡',
    config: {
      skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'TypeScript'],
      emphasisSkill: 'React',
      minExperience: 3,
      strictness: 55,
      skillWeights: { React: 1.4, 'Node.js': 1.3, MongoDB: 1.2, Express: 1.1 },
    },
  },
  {
    id: 'frontend',
    label: 'Frontend Specialist',
    description: 'React / Vue / Angular ecosystem',
    icon: '🎨',
    config: {
      skills: ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript', 'Tailwind CSS'],
      emphasisSkill: 'React',
      minExperience: 2,
      strictness: 60,
      skillWeights: { React: 1.5, TypeScript: 1.3, CSS: 1.1 },
    },
  },
  {
    id: 'backend',
    label: 'Backend Engineer',
    description: 'Node / Python / Java server-side',
    icon: '⚙️',
    config: {
      skills: ['Node.js', 'Python', 'PostgreSQL', 'REST API', 'Docker'],
      emphasisSkill: 'Node.js',
      minExperience: 3,
      strictness: 50,
      skillWeights: { 'Node.js': 1.4, PostgreSQL: 1.2, Docker: 1.1 },
    },
  },
  {
    id: 'devops',
    label: 'DevOps / Cloud',
    description: 'Kubernetes · Docker · Terraform · AWS',
    icon: '☁️',
    config: {
      skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
      emphasisSkill: 'Kubernetes',
      minExperience: 4,
      strictness: 65,
      skillWeights: { Kubernetes: 1.5, Docker: 1.3, AWS: 1.2, Terraform: 1.1 },
    },
  },
  {
    id: 'ml',
    label: 'ML / Data Science',
    description: 'Python · TensorFlow · PyTorch · Data Science',
    icon: '🧠',
    config: {
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science', 'SQL'],
      emphasisSkill: 'Machine Learning',
      minExperience: 3,
      strictness: 60,
      skillWeights: { 'Machine Learning': 1.5, Python: 1.3, TensorFlow: 1.2 },
    },
  },
  {
    id: 'polyglot',
    label: 'Polyglot Engineer',
    description: 'Multi-language, broad tech stack',
    icon: '🌐',
    config: {
      skills: ['JavaScript', 'Python', 'Java', 'Go', 'Docker', 'AWS'],
      emphasisSkill: 'JavaScript',
      minExperience: 5,
      strictness: 30,
      skillWeights: {},
    },
  },
  {
    id: 'fullstack',
    label: 'Full Stack',
    description: 'End-to-end web development',
    icon: '🔧',
    config: {
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker', 'AWS'],
      emphasisSkill: 'React',
      minExperience: 3,
      strictness: 45,
      skillWeights: { React: 1.3, 'Node.js': 1.3, PostgreSQL: 1.1 },
    },
  },
];

// ─── Default config ───────────────────────────────────────────────────────────
export const DEFAULT_SCORING_CONFIG = {
  skills:            [],
  emphasisSkill:     '',
  minExperience:     0,
  preferredLocation: '',
  noticePeriod:      'Any',
  strictness:        50,
  skillWeights:      {},
  preset:            '',
};

// ─── Notice period ordering (lower = more available) ─────────────────────────
const NOTICE_ORDER = { Immediate: 0, '2 weeks': 1, '1 month': 2, '3 months': 3 };

// ─── Semantic skill match ─────────────────────────────────────────────────────
function semanticMatch(targetSkill, candidateSkills) {
  const targetLower = targetSkill.toLowerCase();
  const candidateLower = candidateSkills.map((s) => s.toLowerCase());

  // Exact match
  if (candidateLower.includes(targetLower)) return { type: 'exact', score: 1.0, matchedVia: targetSkill };

  // Ecosystem lookup
  const ecosystemKey = Object.keys(SKILL_ECOSYSTEM).find(
    (k) => k.toLowerCase() === targetLower
  );
  const ecosystem = ecosystemKey ? SKILL_ECOSYSTEM[ecosystemKey] : null;

  if (ecosystem) {
    let best = { score: 0, via: null };
    for (const related of ecosystem.related) {
      if (candidateLower.includes(related.toLowerCase())) {
        const s = ecosystem.weight * 0.65; // semantic partial credit
        if (s > best.score) best = { score: s, via: related };
      }
    }
    if (best.via) return { type: 'semantic', score: best.score, matchedVia: best.via };
  }

  return { type: 'none', score: 0, matchedVia: null };
}

// ─── Main scoring function ────────────────────────────────────────────────────
export function scoreCandidate(candidate, config) {
  const {
    skills = [],
    emphasisSkill = '',
    minExperience = 0,
    preferredLocation = '',
    noticePeriod: requiredNotice = 'Any',
    strictness = 50,
    skillWeights = {},
  } = config;

  if (!skills || skills.length === 0) return null;

  // Strictness factor: 0=lenient (0.5x penalty), 1=strict (1.5x penalty)
  const strictFactor = strictness / 100; // 0–1

  const candidateSkills = candidate.skills || [];
  const matchDetails = [];

  // ── 1. Emphasis skill score (35% base weight) ─────────────────────────────
  let emphasisScore = 0;
  if (emphasisSkill && skills.includes(emphasisSkill)) {
    const m = semanticMatch(emphasisSkill, candidateSkills);
    const manualWeight = skillWeights[emphasisSkill] ?? 1.0;
    emphasisScore = Math.min(m.score * manualWeight, 1.0);
    matchDetails.push({ skill: emphasisSkill, isEmphasis: true, ...m, finalScore: emphasisScore });
  }

  // ── 2. Other skills score (35% base weight) ───────────────────────────────
  const otherSkills = skills.filter((s) => s !== emphasisSkill);
  let otherRawScore = 0;

  for (const skill of otherSkills) {
    const m = semanticMatch(skill, candidateSkills);
    const manualWeight = skillWeights[skill] ?? 1.0;
    const finalScore = Math.min(m.score * manualWeight, 1.0);
    otherRawScore += finalScore;
    matchDetails.push({ skill, isEmphasis: false, ...m, finalScore });
  }

  const normalizedOtherScore = otherSkills.length > 0
    ? Math.min(otherRawScore / otherSkills.length, 1.0)
    : 1.0;

  // Apply strictness: missing skills penalised harder at high strictness
  const missingCount = matchDetails.filter((d) => d.type === 'none').length;
  const missingPenalty = missingCount > 0
    ? 1 - (missingCount / skills.length) * strictFactor * 0.5
    : 1;

  const adjustedOtherScore = normalizedOtherScore * missingPenalty;

  // ── 3. Experience score (20%) ─────────────────────────────────────────────
  let expScore = 1.0;
  if (minExperience > 0) {
    expScore = Math.min(candidate.totalExperience / minExperience, 1.0);
    // Strict mode: under-experience penalised harder
    if (candidate.totalExperience < minExperience) {
      expScore = expScore * (1 - strictFactor * 0.3);
    }
  }

  // ── 4. Location score (5%) ────────────────────────────────────────────────
  let locationScore = 1.0;
  if (preferredLocation && preferredLocation.trim()) {
    const pref = preferredLocation.toLowerCase();
    const loc  = (candidate.location || '').toLowerCase();
    locationScore = loc.includes(pref) ? 1.0 : 0.0;
  }

  // ── 5. Notice period score (5%) ───────────────────────────────────────────
  let noticeScore = 1.0;
  if (requiredNotice && requiredNotice !== 'Any') {
    const reqOrder  = NOTICE_ORDER[requiredNotice] ?? 3;
    const candOrder = NOTICE_ORDER[candidate.noticePeriod] ?? 3;
    noticeScore = candOrder <= reqOrder ? 1.0 : Math.max(0, 1 - (candOrder - reqOrder) * 0.3);
  }

  // ── Weighted final ────────────────────────────────────────────────────────
  const hasLocation = preferredLocation && preferredLocation.trim();
  const hasNotice   = requiredNotice && requiredNotice !== 'Any';

  // Redistribute weights if optional factors not set
  let w = { emphasis: 0.35, other: 0.35, exp: 0.20, loc: 0.05, notice: 0.05 };
  if (!hasLocation && !hasNotice) {
    w = { emphasis: 0.38, other: 0.37, exp: 0.25, loc: 0, notice: 0 };
  } else if (!hasLocation) {
    w = { emphasis: 0.36, other: 0.36, exp: 0.22, loc: 0, notice: 0.06 };
  } else if (!hasNotice) {
    w = { emphasis: 0.36, other: 0.36, exp: 0.22, loc: 0.06, notice: 0 };
  }

  const raw =
    emphasisScore   * w.emphasis +
    adjustedOtherScore * w.other +
    expScore        * w.exp +
    locationScore   * w.loc +
    noticeScore     * w.notice;

  const finalScore = Math.round(Math.min(raw, 1.0) * 100);

  return {
    score:        finalScore,
    emphasisScore: Math.round(emphasisScore * 100),
    skillScore:   Math.round(adjustedOtherScore * 100),
    expScore:     Math.round(expScore * 100),
    locationScore: Math.round(locationScore * 100),
    noticeScore:  Math.round(noticeScore * 100),
    matchDetails,
    weights: w,
  };
}

// ─── Score all candidates and return sorted list ──────────────────────────────
export function rankCandidates(candidates, config) {
  if (!config.skills || config.skills.length === 0) return [];
  return candidates
    .map((c) => ({ candidate: c, result: scoreCandidate(c, config) }))
    .filter((r) => r.result !== null)
    .sort((a, b) => b.result.score - a.result.score);
}

// ─── Colour helpers ───────────────────────────────────────────────────────────
export function getScoreColor(score) {
  if (score === null || score === undefined) return 'text-slate-500';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function getScoreBg(score) {
  if (score === null || score === undefined) return 'bg-slate-800';
  if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/40';
  if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/40';
  if (score >= 40) return 'bg-orange-500/20 border-orange-500/40';
  return 'bg-red-500/20 border-red-500/40';
}

export function getScoreBarColor(score) {
  if (score >= 80) return 'bg-cyan-500';
  if (score >= 60) return 'bg-amber-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}
