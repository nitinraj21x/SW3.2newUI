import { Bell, Sun, Moon, ArrowLeft, LogOut } from 'lucide-react';
import useStore from '../../store/useStore';
import useTheme from '../../store/useTheme';
import { RoleBadge } from '../ui/Badge';

const TAB_TITLES = {
  overview:   { title: 'Overview',        subtitle: 'Recruitment analytics and activity feed' },
  candidates: { title: 'Candidates',      subtitle: 'Manage and search candidate profiles' },
  jobs:       { title: 'Job Orders',      subtitle: 'Active roles, requirements and candidate scores' },
  scoring:    { title: 'Scoring System',  subtitle: 'Configure weighted candidate ranking' },
  events:     { title: 'Events',          subtitle: 'Manage public website events and images' },
  audit:      { title: 'Audit Logs',      subtitle: 'Compliance and activity ledger' },
};

export function Header({ onLogout }) {
  const { activeTab, currentUser } = useStore();
  const { theme, toggleTheme } = useTheme();
  const { title, subtitle } = TAB_TITLES[activeTab] || {};
  const isLight = theme === 'light';

  return (
    <header
      className="h-14 flex items-center px-6 gap-4 sticky top-0 z-30 border-b"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 88%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Back to public site */}
        <a
          href="/"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all mr-1"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.color = 'var(--accent-light)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title="Back to public website"
        >
          <ArrowLeft size={12} /> Back to Site
        </a>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-all duration-150"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-faint)'; }}
          aria-label="Notifications"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} aria-hidden="true" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          className="relative p-2 rounded-lg transition-all duration-200 overflow-hidden"
          style={{ color: 'var(--text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-faint)'; }}
        >
          <span className="block transition-all duration-300" style={{ transform: isLight ? 'translateY(0) rotate(0deg)' : 'translateY(-4px) rotate(-30deg)', opacity: isLight ? 1 : 0, position: isLight ? 'relative' : 'absolute' }}>
            <Sun size={15} />
          </span>
          <span className="block transition-all duration-300" style={{ transform: isLight ? 'translateY(4px) rotate(30deg)' : 'translateY(0) rotate(0deg)', opacity: isLight ? 0 : 1, position: isLight ? 'absolute' : 'relative' }}>
            <Moon size={15} />
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-default)' }} />

        {/* Current user */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)', boxShadow: '0 1px 6px rgba(6,182,212,0.3)' }}
          >
            {currentUser.avatar}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-secondary)' }}>{currentUser.name}</p>
            <RoleBadge role={currentUser.role} />
          </div>
        </div>

        {/* Sign out */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="ml-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-faint)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-faint)'; }}
            aria-label="Sign out"
          >
            <LogOut size={13} /> Sign out
          </button>
        )}
      </div>
    </header>
  );
}
