import React, { useState, useCallback } from 'react';
import { Calendar } from 'lucide-react';

const FloatingEventsButton = React.memo(({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div className="floating-events-button">
      <button
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="floating-events-btn"
      >
        <div className="floating-events-content">
          <Calendar size={24} />
          <span 
            className={`floating-events-text ${
              isHovered ? 'floating-events-text-visible' : 'floating-events-text-hidden'
            }`}
          >
            Upcoming Events
          </span>
        </div>
        
        {/* Notification Badge */}
        <div className="floating-events-badge">
          3
        </div>
        
        {/* Hover Effect */}
        <div className="floating-events-hover" />
      </button>
    </div>
  );
});

export default FloatingEventsButton;