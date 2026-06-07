export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  icon: Icon,
  iconRight: IconRight,
}) {
  const base = [
    'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ].join(' ');

  const variants = {
    primary: [
      'text-white font-semibold',
      'focus:ring-cyan-500',
    ].join(' '),
    secondary: [
      'border font-medium',
      'focus:ring-cyan-500/40',
    ].join(' '),
    danger: [
      'bg-red-600 hover:bg-red-500 text-white',
      'focus:ring-red-500',
    ].join(' '),
    ghost: [
      'bg-transparent font-medium',
      'focus:ring-cyan-500/30',
    ].join(' '),
    success: [
      'bg-emerald-600 hover:bg-emerald-500 text-white',
      'focus:ring-emerald-500',
    ].join(' '),
    warning: [
      'bg-amber-600 hover:bg-amber-500 text-white',
      'focus:ring-amber-500',
    ].join(' '),
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  // Inline styles for theme-variable-dependent variants
  const inlineStyles = {
    primary: {
      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
      boxShadow: '0 1px 8px rgba(6,182,212,0.25)',
    },
    secondary: {
      backgroundColor: 'var(--bg-elevated)',
      borderColor: 'var(--border-default)',
      color: 'var(--text-secondary)',
    },
    ghost: {
      color: 'var(--text-muted)',
    },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={inlineStyles[variant] || {}}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
        if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
        if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
    >
      {Icon && <Icon size={size === 'xs' || size === 'sm' ? 14 : 16} />}
      {children}
      {IconRight && <IconRight size={size === 'xs' || size === 'sm' ? 14 : 16} />}
    </button>
  );
}
