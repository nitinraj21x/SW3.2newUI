/**
 * PortalApp.jsx — kS2
 *
 * All tab components are lazy-loaded — only the active tab's chunk is
 * downloaded, keeping the initial portal bundle small.
 */
import { useEffect, Suspense, lazy } from 'react';
import { Sidebar }   from './components/layout/Sidebar';
import { Header }    from './components/layout/Header';
import { LoginPage } from './components/auth/LoginPage';
import useStore, { PERMISSIONS } from './store/useStore';
import useAuth from './store/useAuth';

// ── Lazy-loaded tab chunks ────────────────────────────────────────────────────
const OverviewTab   = lazy(() => import('./components/overview/OverviewTab'));
const CandidatesTab = lazy(() => import('./components/candidates/CandidatesTab'));
const JobsTab       = lazy(() => import('./components/jobs/JobsTab'));
const ScoringTab    = lazy(() => import('./components/scoring/ScoringTab'));
const EventsTab     = lazy(() => import('./components/events/EventsTab'));
const AuditTab      = lazy(() => import('./components/audit/AuditTab'));

function TabSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
    </div>
  );
}

export default function PortalApp() {
  const { status, user, logout, init } = useAuth();
  const {
    activeTab, setCurrentUser,
    fetchCandidates, fetchJobs, fetchEvents, fetchAuditLogs,
  } = useStore();

  // Verify existing session on mount
  useEffect(() => { init(); }, []); // eslint-disable-line

  // On successful auth: sync user into store + fetch data for this role
  useEffect(() => {
    if (status !== 'authenticated' || !user) return;
    setCurrentUser({ id: user.id, _id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar });
    fetchCandidates();
    if (user.role === 'admin' || user.role === 't-1' || user.role === 't-2') fetchJobs();
    if (user.role === 'admin' || user.role === 't-1') { fetchEvents(); fetchAuditLogs(); }
  }, [status, user]); // eslint-disable-line

  // Loading spinner while verifying token on mount
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>⚡</div>
          <p className="text-sm" style={{ color: 'var(--text-faint)' }}>Loading portal…</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') return <LoginPage />;

  const safeTab = PERMISSIONS.canViewTab(user.role, activeTab)
    ? activeTab
    : (user.role === 't-3' ? 'candidates' : 'overview');

  return (
    <div className="flex min-h-screen transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-base)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar onLogout={logout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onLogout={logout} />
        <main className="flex-1 overflow-y-auto" role="main">
          <Suspense fallback={<TabSpinner />}>
            {safeTab === 'overview'   && PERMISSIONS.canViewTab(user.role, 'overview')   && <OverviewTab />}
            {safeTab === 'candidates' && <CandidatesTab />}
            {safeTab === 'jobs'       && PERMISSIONS.canViewJobs(user.role)              && <JobsTab />}
            {safeTab === 'scoring'    && PERMISSIONS.canViewScoring(user.role)           && <ScoringTab />}
            {safeTab === 'events'     && PERMISSIONS.canViewEvents(user.role)            && <EventsTab />}
            {safeTab === 'audit'      && PERMISSIONS.canViewAudit(user.role)             && <AuditTab />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
