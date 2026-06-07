import React from 'react';
import Reveal from './Reveal';

const Section = React.memo(({ id, title, subtitle, children, className = "", dark = false }) => (
  <section id={id} className={`section ${dark ? 'bg-slate-900' : 'bg-slate-950'} ${className}`}>
    {/* Decorative Elements */}
    <div className="section-decorative-top"></div>
    <div className="section-decorative-bottom"></div>

    <div className="section-container relative z-10">
      <Reveal>
        <div className="section-header text-center md-text-left">
          <h2 className="section-title tracking-tight">{title}</h2>
          <div className="section-divider"></div>
          {subtitle && <p className="section-subtitle mx-auto md-mx-0">{subtitle}</p>}
        </div>
      </Reveal>
      {children}
    </div>
  </section>
));

export default Section;