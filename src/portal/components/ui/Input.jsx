const inputBase = [
  'w-full px-3 py-2 rounded-lg text-sm transition-colors duration-150',
  'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

const inputStyle = {
  backgroundColor: 'var(--bg-input)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-primary)',
};

export function Input({ label, error, hint, className = '', required, ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        {...props}
        required={required}
        className={inputBase}
        style={{
          ...inputStyle,
          borderColor: error ? '#f87171' : 'var(--border-default)',
        }}
        placeholder={props.placeholder}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className = '', required, rows = 3, ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        {...props}
        rows={rows}
        required={required}
        className={`${inputBase} resize-none`}
        style={inputStyle}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{hint}</p>}
    </div>
  );
}

export function Select({ label, error, hint, className = '', required, children, ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        {...props}
        required={required}
        className={inputBase}
        style={inputStyle}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{hint}</p>}
    </div>
  );
}

