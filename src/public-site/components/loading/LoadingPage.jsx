import React, { useEffect, useState } from 'react';
import logoSW from '../../image/logo/logoSWTransparent.png';

const TAGLINE = 'The Future of Connection';

/**
 * LoadingPage
 *
 * Timeline (ms):
 *   0        — logo pops in, tagline stroke appears
 *   400      — gradient fill starts sweeping left→right (2s)
 *   1800     — fill at ~90% → logo flies off to top
 *   2400     — page fades out
 *   3000     — onComplete fires
 */
const LoadingPage = ({ onComplete }) => {
  const [logoExit, setLogoExit] = useState(false);
  const [pageExit, setPageExit] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLogoExit(true), 1800);
    const t2 = setTimeout(() => setPageExit(true), 2400);
    const t3 = setTimeout(() => onComplete?.(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`loading-page${pageExit ? ' loading-page--exit' : ''}`}>
      <div className="loading-orb loading-orb--1" />
      <div className="loading-orb loading-orb--2" />

      <div className="loading-content">
        {/* Logo — flies off top at 90% */}
        <div className={`loading-logo-wrap${logoExit ? ' loading-logo-wrap--exit' : ''}`}>
          <img src={logoSW} alt="Sewing Circle logo" className="loading-logo" />
          <div className="loading-logo-ring" />
        </div>

        {/* Tagline — stroke outline that fills with gradient left→right */}
        <p className="loading-tagline" data-text={TAGLINE}>
          {TAGLINE}
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
