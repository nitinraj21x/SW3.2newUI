import React from 'react';

// Lucide renamed Linkedin → use SVG fallback for compatibility
const LinkedinIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const Footer = React.memo(() => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3 className="footer-brand-title">The Sewing Circle</h3>
          <p className="footer-brand-subtitle">Weaving connections, one thread at a time</p>
        </div>
        
        <div className="footer-social">
          <span className="footer-follow-label">Follow us on :</span>
          <a href="https://www.linkedin.com/company/sewing-circle-llc/" className="footer-social-link" aria-label="LinkedIn">
            <LinkedinIcon size={20} />
          </a>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="footer-copyright">
          © 2024 The Sewing Circle. All rights reserved.
        </p>
      </div>
    </footer>
  );
});

export default Footer;