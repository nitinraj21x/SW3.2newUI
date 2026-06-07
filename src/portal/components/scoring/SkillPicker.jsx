import { useState, useMemo } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';
import { SKILL_CATEGORIES, ALL_SKILLS } from '../../data/skillCategories';

/**
 * Categorized skill picker.
 * Shows category tabs with skill chips. Supports search across all categories.
 * Selected skills are shown at the top with remove buttons.
 */
export function SkillPicker({ selected, onChange, emphasisSkill, onEmphasisChange }) {
  const [activeCategory, setActiveCategory] = useState(SKILL_CATEGORIES[0].id);
  const [search, setSearch] = useState('');

  const toggleSkill = (skill) => {
    if (selected.includes(skill)) {
      const next = selected.filter((s) => s !== skill);
      onChange(next);
      // Clear emphasis if it was this skill
      if (emphasisSkill === skill) onEmphasisChange('');
    } else {
      onChange([...selected, skill]);
    }
  };

  const removeSkill = (skill) => {
    onChange(selected.filter((s) => s !== skill));
    if (emphasisSkill === skill) onEmphasisChange('');
  };

  // Search results across all categories
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return ALL_SKILLS.filter((s) => s.toLowerCase().includes(q)).slice(0, 20);
  }, [search]);

  const currentCategory = SKILL_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="space-y-3">
      {/* Selected skills */}
      {selected.length > 0 && (
        <div className="rounded-xl border p-3 space-y-2"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
              Selected ({selected.length})
            </p>
            <button
              onClick={() => { onChange([]); onEmphasisChange(''); }}
              className="text-xs transition-colors hover:text-red-400"
              style={{ color: 'var(--text-ghost)' }}
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((skill) => {
              const isEmphasis = emphasisSkill === skill;
              return (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-md text-xs font-medium border"
                  style={isEmphasis ? {
                    backgroundColor: 'rgba(234,179,8,0.15)',
                    borderColor: 'rgba(234,179,8,0.4)',
                    color: '#fbbf24',
                  } : {
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {isEmphasis && <span className="mr-0.5">★</span>}
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-0.5 p-0.5 rounded transition-colors hover:text-red-400"
                    style={{ color: 'var(--text-ghost)' }}
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
        <input
          type="text"
          placeholder="Search all skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-faint)' }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Search results */}
      {search.trim() ? (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="px-3 py-2 border-b" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{search}"
            </p>
          </div>
          <div className="p-3 flex flex-wrap gap-1.5" style={{ backgroundColor: 'var(--bg-surface)' }}>
            {searchResults.length === 0 ? (
              <p className="text-xs w-full text-center py-4" style={{ color: 'var(--text-ghost)' }}>
                No skills found. You can still type a custom skill below.
              </p>
            ) : searchResults.map((skill) => (
              <SkillChip
                key={skill}
                skill={skill}
                selected={selected.includes(skill)}
                isEmphasis={emphasisSkill === skill}
                onToggle={() => toggleSkill(skill)}
              />
            ))}
          </div>
          {/* Custom skill add */}
          {search.trim() && !ALL_SKILLS.some((s) => s.toLowerCase() === search.toLowerCase()) && (
            <div className="px-3 pb-3" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <button
                onClick={() => { toggleSkill(search.trim()); setSearch(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; e.currentTarget.style.color = 'var(--accent-light)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Plus size={11} /> Add "{search.trim()}" as custom skill
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Category browser */
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
          {/* Category tabs */}
          <div
            className="flex overflow-x-auto border-b"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            {SKILL_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const selectedInCat = cat.skills.filter((s) => selected.includes(s)).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors shrink-0"
                  style={isActive ? {
                    borderBottomColor: cat.color.dot,
                    color: cat.color.text,
                    backgroundColor: cat.color.bg,
                  } : {
                    borderBottomColor: 'transparent',
                    color: 'var(--text-faint)',
                  }}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                  {selectedInCat > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: cat.color.bg, color: cat.color.text, border: `1px solid ${cat.color.border}` }}
                    >
                      {selectedInCat}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Skills grid */}
          <div className="p-3 flex flex-wrap gap-1.5 min-h-[80px]" style={{ backgroundColor: 'var(--bg-surface)' }}>
            {currentCategory?.skills.map((skill) => (
              <SkillChip
                key={skill}
                skill={skill}
                selected={selected.includes(skill)}
                isEmphasis={emphasisSkill === skill}
                categoryColor={currentCategory.color}
                onToggle={() => toggleSkill(skill)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom skill input */}
      {!search.trim() && (
        <CustomSkillInput onAdd={(skill) => {
          if (skill && !selected.includes(skill)) onChange([...selected, skill]);
        }} />
      )}
    </div>
  );
}

function SkillChip({ skill, selected, isEmphasis, categoryColor, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
      style={selected ? (isEmphasis ? {
        backgroundColor: 'rgba(234,179,8,0.15)',
        borderColor: 'rgba(234,179,8,0.4)',
        color: '#fbbf24',
      } : {
        backgroundColor: categoryColor?.bg || 'rgba(6,182,212,0.15)',
        borderColor: categoryColor?.border || 'rgba(6,182,212,0.4)',
        color: categoryColor?.text || 'var(--accent-light)',
      }) : {
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)',
        color: 'var(--text-muted)',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = categoryColor?.bg || 'rgba(6,182,212,0.1)';
          e.currentTarget.style.borderColor = categoryColor?.border || 'rgba(6,182,212,0.3)';
          e.currentTarget.style.color = categoryColor?.text || 'var(--accent-light)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
    >
      {selected && !isEmphasis && <Check size={10} className="shrink-0" />}
      {isEmphasis && <span className="shrink-0">★</span>}
      {skill}
    </button>
  );
}

function CustomSkillInput({ onAdd }) {
  const [value, setValue] = useState('');
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && value.trim()) {
      e.preventDefault();
      onAdd(value.trim().replace(/,$/, ''));
      setValue('');
    }
  };
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Add custom skill (press Enter)..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
      />
      <button
        onClick={() => { if (value.trim()) { onAdd(value.trim()); setValue(''); } }}
        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; e.currentTarget.style.color = 'var(--accent-light)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <Plus size={12} />
      </button>
    </div>
  );
}


