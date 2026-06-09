import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import logoSW from '../../image/logo/logoSWTransparent.png';

/**
 * Navigation Component
 *
 * Logo click animation sequence (normal speed):
 *  1. Logo exits upward          — 0.5s
 *  2. Site blurs                 — 0.3s delay, then blur transition
 *  3. Enlarged logo rolls in     — 0.3s after blur starts, 0.5s roll-in
 *  4. Holds for 5s
 *  5. Enlarged logo rolls out    — 0.5s
 *  6. Site unblurs               — 0.3s delay after roll-out starts
 *  7. Nav logo returns down      — 0.3s delay after unblur, 0.5s
 *
 * Any click during animation triggers early-exit at 2× speed.
 */

// Timing constants (ms) — normal speed
const T = {
  logoExit:    500,
  blurDelay:   300,
  popDelay:    300,
  popIn:       500,
  hold:        5000,
  popOut:      500,
  unblurDelay: 300,
  returnDelay: 300,
  logoReturn:  500,
};

function runSequence(steps) {
  // steps: [{ delay, fn }]  — each delay is relative to the previous step
  let elapsed = 0;
  const ids = [];
  for (const { delay, fn } of steps) {
    elapsed += delay;
    ids.push(setTimeout(fn, elapsed));
  }
  return () => ids.forEach(clearTimeout);
}

const Navigation = React.memo(({ loadingDone = false }) => {
  const [isScrolled, setIsScrolled]         = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Animation states
  const [logoHidden,  setLogoHidden]  = useState(false); // nav logo gone upward
  const [siteBlurred, setSiteBlurred] = useState(false);
  const [overlayPhase, setOverlayPhase] = useState('hidden'); // 'hidden' | 'in' | 'visible' | 'out'

  // Intro animation: logo starts offscreen, drops in after loading done + 0.3s delay
  const [introPhase, setIntroPhase] = useState('offscreen'); // 'offscreen' | 'drop'

  const cancelRef = useRef(null);
  const animatingRef = useRef(false);

  const navLinks = useMemo(() => [
    { name: 'Home',       href: '#hero' },
    { name: 'About Us',   href: '#about' },
    { name: 'Objectives', href: '#objectives' },
    { name: 'Vision',     href: '#vision' },
    { name: 'Future',     href: '#future' },
    { name: 'Community',  href: '#community' },
    { name: 'Events',     href: '#events' },
    { name: 'Contact Us', href: '#contact' },
  ], []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trigger logo drop-in 0.3s after loading page completes
  useEffect(() => {
    if (!loadingDone) return;
    const t = setTimeout(() => setIntroPhase('drop'), 300);
    return () => clearTimeout(t);
  }, [loadingDone]);

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(p => !p), []);
  const closeMobileMenu  = useCallback(() => setIsMobileMenuOpen(false), []);

  // Shared exit-and-reset sequence, speed multiplier for early exit
  const runExitSequence = useCallback((speed = 1) => {
    const s = (ms) => Math.round(ms / speed);

    if (cancelRef.current) cancelRef.current();

    cancelRef.current = runSequence([
      { delay: 0,                      fn: () => setOverlayPhase('out') },
      { delay: s(T.popOut + T.unblurDelay), fn: () => setSiteBlurred(false) },
      { delay: s(T.returnDelay),       fn: () => setLogoHidden(false) },
      { delay: s(T.logoReturn),        fn: () => { animatingRef.current = false; cancelRef.current = null; } },
    ]);
  }, []);

  const handleLogoClick = useCallback(() => {
    if (animatingRef.current) return;
    animatingRef.current = true;

    cancelRef.current = runSequence([
      // 1. Logo exits up
      { delay: 0,                fn: () => setLogoHidden(true) },
      // 2. Blur site
      { delay: T.logoExit + T.blurDelay, fn: () => setSiteBlurred(true) },
      // 3. Roll in overlay
      { delay: T.popDelay,       fn: () => setOverlayPhase('in') },
      // 4. Mark as fully visible after roll-in
      { delay: T.popIn,          fn: () => setOverlayPhase('visible') },
      // 5. After hold, start exit
      { delay: T.hold,           fn: () => runExitSequence(1) },
    ]);
  }, [runExitSequence]);

  // Any click while animating triggers early exit at 2× speed
  const handleEarlyExit = useCallback(() => {
    if (!animatingRef.current) return;
    if (cancelRef.current) cancelRef.current();
    runExitSequence(2);
  }, [runExitSequence]);

  // Cleanup on unmount
  useEffect(() => () => { if (cancelRef.current) cancelRef.current(); }, []);

  const isAnimating = logoHidden || siteBlurred || overlayPhase !== 'hidden';

  return (
    <>
      <nav className={`navigation ${isScrolled ? 'scrolled' : 'transparent'}`}>
        <div className="navigation-container">
          {/* Logo/Brand */}
          <div
            className="navigation-brand"
            onClick={handleLogoClick}
            style={{ cursor: animatingRef.current ? 'default' : 'pointer' }}
            role="button"
            aria-label="Animate logo"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && handleLogoClick()}
          >
            SEWING
            <div className="logo-container">
              <div className={`logo-intro-wrap logo-intro-wrap--${introPhase}`}>
                <img
                  src={logoSW}
                  alt="Sewing Circle Logo"
                  className={`logo-main logo-nav${logoHidden ? ' logo-nav--hidden' : ' logo-nav--visible'}`}
                />
              </div>
              <div className="logo-glow-dot"></div>
            </div>
            <span className="light-text">CIRCLE</span>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="navigation-menu">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="navigation-link">{link.name}</a>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button className="mobile-menu-button" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : 'closed'}`}>
          <div className="mobile-menu-content">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="mobile-menu-link" onClick={closeMobileMenu}>
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Portaled overlays */}
      {createPortal(
        <>
          {/* Site blur overlay — click to dismiss */}
          <div
            className={`logo-anim-blur${siteBlurred ? ' logo-anim-blur--active' : ''}`}
            onClick={isAnimating ? handleEarlyExit : undefined}
          />

          {/* Enlarged logo */}
          <div
            className={`logo-anim-overlay logo-anim-overlay--${overlayPhase}`}
            onClick={isAnimating ? handleEarlyExit : undefined}
          >
            <img src={logoSW} alt="Sewing Circle Logo" className="logo-anim-overlay-img" />
          </div>
        </>,
        document.body
      )}
    </>
  );
});

export default Navigation;
