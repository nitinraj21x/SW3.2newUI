import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Reveal from '../shared/Reveal';

// Import local images
import dec1 from '../../image/2025/December/dec1.jpg';
import dec2 from '../../image/2025/December/dec2.jpg';
import oct1 from '../../image/2025/October/oct1.png';
import oct2 from '../../image/2025/October/oct2.png';
import oct3 from '../../image/2025/October/oct3.png';
import april1 from '../../image/2025/April/april1.jpg';
import april2 from '../../image/2025/April/april2.jpg';
import april3 from '../../image/2025/April/april3.jpg';
import feb1 from '../../image/2025/February/feb1.jpg';
import feb2 from '../../image/2025/February/feb2.jpg';
import june1 from '../../image/2025/June/june1.jpg';
import june2 from '../../image/2025/June/june2.jpg';

/**
 * EventSlider Component
 * 
 * Displays a smooth auto-advancing slider showcasing recent community events.
 * Features:
 * - Auto-advances every 5 seconds
 * - Shows 3 events at a time on desktop, 1 on mobile
 * - Smooth left-sliding transitions
 * - Interactive dot navigation
 * - Uses local images organized by event month
 * 
 * @returns {JSX.Element} The EventSlider component
 */
const EventSlider = React.memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Events data with local images organized by month
  const events = useMemo(() => [
    {
      id: 1,
      name: "Community Workshop Series",
      date: "April 2024",
      coverImage: april1,
      description: "Interactive workshops focusing on building stronger community connections through collaborative activities and meaningful conversations."
    },
    {
      id: 2,
      name: "Digital Wellness Meetup", 
      date: "February 2024",
      coverImage: feb1,
      description: "A focused session on maintaining healthy relationships with technology while fostering genuine human connections."
    },
    {
      id: 3,
      name: "Volunteer Planning Session",
      date: "December 2024",
      coverImage: dec1,
      description: "Local volunteers came together to organize community outreach initiatives and create sustainable volunteer programs."
    },
    {
      id: 4,
      name: "Connection Circle Gathering",
      date: "October 2024", 
      coverImage: oct1,
      description: "An intimate gathering focused on building authentic relationships through structured conversations and shared experiences."
    },
    {
      id: 5,
      name: "Empathy in Action Workshop",
      date: "June 2024",
      coverImage: june1,
      description: "A hands-on workshop exploring how empathy can transform workplace dynamics and community relationships."
    }
  ], []);

  // Auto-advance slider every 5 seconds with smooth transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === events.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [events.length]);

  // Calculate visible events for responsive display
  const getVisibleEvents = () => {
    const visibleEvents = [];
    // Show 3 events on desktop, but ensure we don't exceed array bounds
    const eventsToShow = Math.min(3, events.length);
    
    for (let i = 0; i < eventsToShow; i++) {
      const index = (currentIndex + i) % events.length;
      visibleEvents.push({ ...events[index], displayIndex: i });
    }
    return visibleEvents;
  };

  const visibleEvents = getVisibleEvents();

  // Manual navigation handler
  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  return (
    <Reveal>
      <div className="event-slider">
        {/* Main slider container with improved overflow handling */}
        <div className="event-slider-container">
          <div className="event-slider-track">
            {/* Desktop view: Show 3 events side by side */}
            <div className="event-slider-desktop">
              {visibleEvents.map((event, index) => (
                <div 
                  key={`${event.id}-${currentIndex}-${index}`}
                  className="event-card desktop"
                >
                  {/* Event image with optimized loading */}
                  <div className="event-image">
                    <img 
                      src={event.coverImage}
                      alt={`${event.name} - ${event.date}`}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  {/* Event details */}
                  <div className="event-details">
                    <div className="event-date">{event.date}</div>
                    <h3 className="event-title">{event.name}</h3>
                    <p className="event-description">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile view: Show 1 event at a time */}
            <div className="event-slider-mobile">
              {visibleEvents.slice(0, 1).map((event, index) => (
                <div 
                  key={`mobile-${event.id}-${currentIndex}`}
                  className="event-card mobile"
                >
                  <div className="event-image">
                    <img 
                      src={event.coverImage}
                      alt={`${event.name} - ${event.date}`}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="event-details">
                    <div className="event-date">{event.date}</div>
                    <h3 className="event-title">{event.name}</h3>
                    <p className="event-description">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Navigation dots with improved accessibility */}
        <div className="event-dots">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`event-dot ${index === currentIndex ? 'active' : 'inactive'}`}
              aria-label={`Go to event ${index + 1}: ${events[index].name}`}
            />
          ))}
        </div>

        {/* Event counter for better UX */}
        <div className="event-counter">
          <span className="event-counter-text">
            {currentIndex + 1} of {events.length} events
          </span>
        </div>
      </div>
    </Reveal>
  );
});

export default EventSlider;