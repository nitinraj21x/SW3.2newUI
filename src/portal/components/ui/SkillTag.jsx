import { X } from 'lucide-react';

export function SkillTag({ skill, onRemove, highlight = false }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border transition-colors"
      style={highlight ? {
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
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(skill)}
          className="ml-0.5 transition-colors hover:text-red-400"
          style={{ color: 'var(--text-ghost)' }}
          aria-label={`Remove ${skill}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}

export function SkillInput({ skills, onChange, placeholder = 'Type a skill and press Enter...' }) {
  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && e.target.value.trim()) {
      e.preventDefault();
      const newSkill = e.target.value.trim().replace(/,$/, '');
      if (newSkill && !skills.includes(newSkill)) {
        onChange([...skills, newSkill]);
      }
      e.target.value = '';
    }
  };

  const removeSkill = (skill) => onChange(skills.filter((s) => s !== skill));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {skills.map((skill) => (
          <SkillTag key={skill} skill={skill} onRemove={removeSkill} />
        ))}
      </div>
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
        style={{
          backgroundColor: 'var(--bg-input)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
        }}
      />
      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Press Enter or comma to add a skill</p>
    </div>
  );
}


