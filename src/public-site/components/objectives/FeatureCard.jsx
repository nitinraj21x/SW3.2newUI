import React from 'react';
import Reveal from '../shared/Reveal';

const FeatureCard = React.memo(({ icon: Icon, title, description, delay }) => (
  <Reveal delay={delay} className="h-full">
    <div className="feature-card group">
      <div className="feature-card-bg"></div>
      
      <div className="feature-card-content">
        {/* Icon - visible initially, hidden on hover */}
        <div className="feature-card-icon">
          <Icon className="feature-card-icon-svg" size={28} />
        </div>
        
        {/* Title - always visible, moves up on hover */}
        <h3 className="feature-card-title">{title}</h3>
        
        {/* Description - hidden initially, appears on hover */}
        <p className="feature-card-description">
          {description}
        </p>
      </div>
    </div>
  </Reveal>
));

export default FeatureCard;