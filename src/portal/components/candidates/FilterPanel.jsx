import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { SkillTag } from '../ui/SkillTag';
import { Button } from '../ui/Button';

const NOTICE_OPTIONS = ['Any', 'Immediate', '2 weeks', '1 month', '3 months'];
const STATUS_OPTIONS  = ['All', 'Active', 'Interviewing', 'Placed', 'Inactive'];
const EXP_OPTIONS     = [
  { label: 'Any',     min: 0,  max: 99 },
  { label: '0–2 yrs', min: 0,  max: 2  },
  { label: '3–5 yrs', min: 3,  max: 5  },
  { label: '6–9 yrs', min: 6,  max: 9  },
  { label: '10+ yrs', min: 10, max: 99 },
];

const POPULAR_SKILLS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker', 'Java', 'Machine Learning',
];

const selectStyle = {
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-primary)',
};

export function FilterPanel({ filters, onChange }) {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = (skill) => {
    if (skill && !filters.skills.includes(skill)) {
      onChange({ ...filters, skills: [...filters.skills, skill] });
    }
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    onChange({ ...filters, skills: filters.skills.filter((s) => s !== skill) });
  };

  const handleSkillKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput.trim().replace(/,$/, ''));
    }
  };

  const clearAll = () => {
    onChange({ search: '', skills: [], experience: EXP_OPTIONS[0], noticePeriod: 'Any', status: 'All', location: '' });
  };

  const hasFilters = filters.search || filters.skills.length > 0 ||
    filters.noticePeriod !== 'Any' || filters.status !== 'All' ||
    filters.location || filters.experience.label !== 'Any';

  return (
    <div
      className="rounded-xl p-4 space-y-4 transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
        <input
          type="text"
          placeholder="Search by name, email, role, company..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
          style={{ ...selectStyle, '::placeholder': { color: 'var(--text-faint)' } }}
          aria-label="Search candidates"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Status',
            value: filters.status,
            onChange: (v) => onChange({ ...filters, status: v }),
            options: STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
          },
          {
            label: 'Experience',
            value: filters.experience.label,
            onChange: (v) => onChange({ ...filters, experience: EXP_OPTIONS.find((o) => o.label === v) }),
            options: EXP_OPTIONS.map((o) => ({ value: o.label, label: o.label })),
          },
          {
            label: 'Notice Period',
            value: filters.noticePeriod,
            onChange: (v) => onChange({ ...filters, noticePeriod: v }),
            options: NOTICE_OPTIONS.map((n) => ({ value: n, label: n })),
          },
        ].map(({ label, value, onChange: onCh, options }) => (
          <div key={label} className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{label}</label>
            <select
              value={value}
              onChange={(e) => onCh(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              style={selectStyle}
            >
              {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        ))}

        {/* Location */}
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Location</label>
          <input
            type="text"
            placeholder="e.g. San Francisco"
            value={filters.location}
            onChange={(e) => onChange({ ...filters, location: e.target.value })}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
            style={selectStyle}
          />
        </div>
      </div>

      {/* Skill chips */}
      <div className="space-y-2">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>Filter by Skills</label>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_SKILLS.map((skill) => {
            const active = filters.skills.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => active ? removeSkill(skill) : addSkill(skill)}
                className="px-2 py-0.5 rounded-md text-xs font-medium border transition-colors"
                style={active ? {
                  backgroundColor: 'rgba(6,182,212,0.15)',
                  color: 'var(--accent-light)',
                  borderColor: 'rgba(6,182,212,0.35)',
                } : {
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-muted)',
                  borderColor: 'var(--border-default)',
                }}
              >
                {skill}
              </button>
            );
          })}
        </div>
        {filters.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {filters.skills.map((skill) => (
              <SkillTag key={skill} skill={skill} onRemove={removeSkill} highlight />
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom skill filter..."
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            className="flex-1 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            style={selectStyle}
          />
          <Button variant="secondary" size="sm" onClick={() => addSkill(skillInput)}>Add</Button>
        </div>
      </div>

      {hasFilters && (
        <div className="flex justify-end pt-1">
          <Button variant="ghost" size="sm" icon={X} onClick={clearAll}>Clear All Filters</Button>
        </div>
      )}
    </div>
  );
}

export const DEFAULT_FILTERS = {
  search: '',
  skills: [],
  experience: { label: 'Any', min: 0, max: 99 },
  noticePeriod: 'Any',
  status: 'All',
  location: '',
};


