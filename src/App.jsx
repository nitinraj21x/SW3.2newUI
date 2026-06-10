import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy, Component } from 'react';

// ── Public site ───────────────────────────────────────────────────────────────
// Lazy-loaded — only downloaded when a user visits a non-portal route
const PublicSite = lazy(() => import('./public-site/App.jsx'));

// ── Portal — lazy loaded ──────────────────────────────────────────────────────
const PortalApp = lazy(() => import('./portal/PortalApp.jsx'));

function PortalFallback() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', backgroundColor: '#0a0f1a',
      color: '#e8edf5', fontFamily: 'system-ui, sans-serif',
      flexDirection: 'column', gap: '12px',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>⚡</div>
      <p style={{ fontSize: 14, color: '#6b7fa3' }}>Loading portal…</p>
    </div>
  );
}

// Error boundary — catches crashes in the portal chunk and shows a message
// instead of a blank page
class PortalErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', backgroundColor: '#0a0f1a',
          color: '#e8edf5', fontFamily: 'system-ui, sans-serif',
          flexDirection: 'column', gap: '12px', padding: '2rem', textAlign: 'center',
        }}>
          <p style={{ fontSize: 16, color: '#f87171' }}>Something went wrong loading the portal.</p>
          <p style={{ fontSize: 13, color: '#6b7fa3', maxWidth: 400 }}>
            {this.state.error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 12, padding: '8px 20px', borderRadius: 8,
              background: '#06b6d4', color: '#fff', border: 'none',
              cursor: 'pointer', fontSize: 13,
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <Routes>
      <Route path="/*" element={
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#020617' }} />}>
          <PublicSite />
        </Suspense>
      } />
      <Route
        path="/portal/*"
        element={
          <PortalErrorBoundary>
            <Suspense fallback={<PortalFallback />}>
              <PortalApp />
            </Suspense>
          </PortalErrorBoundary>
        }
      />
    </Routes>
  );
}
