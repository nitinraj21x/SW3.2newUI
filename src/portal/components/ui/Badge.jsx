// All badge variants use CSS variables so they respond to theme switches
const VARIANTS = {
  default:  { bg: 'var(--bg-elevated)',          color: 'var(--text-muted)',    border: 'var(--border-default)' },
  primary:  { bg: 'rgba(6,182,212,0.12)',         color: '#22d3ee',              border: 'rgba(6,182,212,0.25)' },
  success:  { bg: 'rgba(16,185,129,0.12)',        color: '#34d399',              border: 'rgba(16,185,129,0.25)' },
  warning:  { bg: 'rgba(245,158,11,0.12)',        color: '#fbbf24',              border: 'rgba(245,158,11,0.25)' },
  danger:   { bg: 'rgba(239,68,68,0.12)',         color: '#f87171',              border: 'rgba(239,68,68,0.25)' },
  info:     { bg: 'rgba(6,182,212,0.12)',         color: '#22d3ee',              border: 'rgba(6,182,212,0.25)' },
  purple:   { bg: 'rgba(168,85,247,0.12)',        color: '#c084fc',              border: 'rgba(168,85,247,0.25)' },
  amber:    { bg: 'rgba(251,191,36,0.12)',        color: '#fbbf24',              border: 'rgba(251,191,36,0.25)' },
  skill:    { bg: 'var(--bg-elevated)',           color: 'var(--text-secondary)', border: 'var(--border-default)' },
};

const SIZES = {
  xs: { padding: '2px 6px',  fontSize: '0.65rem' },
  sm: { padding: '2px 8px',  fontSize: '0.72rem' },
  md: { padding: '4px 10px', fontSize: '0.8rem'  },
};

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const v = VARIANTS[variant] || VARIANTS.default;
  const s = SIZES[size]       || SIZES.sm;

  return (
    <span
      className={`inline-flex items-center rounded font-semibold tracking-wide ${className}`}
      style={{
        backgroundColor: v.bg,
        color:           v.color,
        border:          `1px solid ${v.border}`,
        padding:         s.padding,
        fontSize:        s.fontSize,
        letterSpacing:   '0.02em',
      }}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Active:       'success',
    Interviewing: 'warning',
    Placed:       'primary',
    Inactive:     'default',
    Rejected:     'danger',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
}

export function RoleBadge({ role }) {
  const map = {
    't-1': { label: 'Admin',     variant: 'danger'  },
    't-2': { label: 'Recruiter', variant: 'primary' },
    't-3': { label: 'Client',    variant: 'purple'  },
  };
  const { label, variant } = map[role] || { label: role, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}
