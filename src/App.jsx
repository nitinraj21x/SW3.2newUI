import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// ── Public site (sewingStatic-master) ─────────────────────────────────────────
import PublicSite from './public-site/App.jsx';

// ── Portal (candidatePortal) — lazy loaded so it doesn't bloat the public bundle
const PortalApp = lazy(() => import('./portal/PortalApp.jsx'));

function PortalFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0f1a',
      color: '#e8edf5',
      fontFamily: 'system-ui, sans-serif',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>⚡</div>
      <p style={{ fontSize: 14, color: '#6b7fa3' }}>Loading portal…</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public website — all routes not under /portal */}
      <Route path="/*" element={<PublicSite />} />

      {/* Employee portal — /portal and all sub-routes */}
      <Route
        path="/portal/*"
        element={
          <Suspense fallback={<PortalFallback />}>
            <PortalApp />
          </Suspense>
        }
      />
    </Routes>
  );
}
