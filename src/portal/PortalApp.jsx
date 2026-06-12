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

  // Verify existing session on mount — hard 10s fallback to login
  useEffect(() => {
    init();
    // Safety net: if status doesn't transition within 10s, force login page
    const fallback = setTimeout(() => {
      const s = useAuth.getState().status;
      if (s === 'idle' || s === 'loading') {
        sessionStorage.removeItem('sc_token');
        useAuth.setState({ status: 'unauthenticated' });
      }
    }, 10000);
    return () => clearTimeout(fallback);
  }, []); // eslint-disable-line

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
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', backgroundColor: '#0a0f1a',
        flexDirection: 'column', gap: '16px', fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>⚡</div>
        <p style={{ color: '#6b7fa3', fontSize: 14, margin: 0 }}>Loading portal…</p>
        <p style={{ color: '#2e3f5c', fontSize: 11, margin: 0 }}>status: {status}</p>
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
