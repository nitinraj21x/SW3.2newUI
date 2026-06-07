import React, { useMemo, useCallback } from 'react';
import { Calendar, Clock, MapPin, X, Users } from 'lucide-react';

const UpcomingEvents = React.memo(({ isOpen, onClose, onGetInvolved }) => {

  const events = useMemo(() => [
    {
      id: 1,
      title: "Community Connection Workshop",
      date: "2025-02-15",
      time: "6:00 PM",
      location: "Community Center Hall A",
      description: "Learn effective communication techniques and build meaningful connections."
    },
    {
      id: 2,
      title: "Digital Wellness Discussion",
      date: "2025-02-22",
      time: "7:00 PM", 
      location: "Local Library Meeting Room",
      description: "Exploring healthy relationships with technology in our daily lives."
    },
    {
      id: 3,
      title: "Volunteer Planning Session",
      date: "2025-03-01",
      time: "5:30 PM",
      location: "Sewing Circle HQ",
      description: "Plan upcoming community service projects and volunteer opportunities."
    }
  ], []);

  const handleEventClick = useCallback(() => {
    onClose();
    onGetInvolved();
  }, [onClose, onGetInvolved]);

  if (!isOpen) return null;

  return (
    <div className="upcoming-events-modal">
      <div 
        className="upcoming-events-backdrop" 
        onClick={onClose}
      />
      
      <div className="upcoming-events-panel">
        <div className="upcoming-events-header">
          <h3 className="upcoming-events-title">Upcoming Events</h3>
          <button onClick={onClose} className="upcoming-events-close">
            <X size={20} />
          </button>
        </div>

        <div className="upcoming-events-content">
          <div className="upcoming-events-list">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="upcoming-event-card"
                onClick={handleEventClick}
              >
                <h4 className="upcoming-event-title">{event.title}</h4>
                <div className="upcoming-event-details">
                  <div className="upcoming-event-detail">
                    <Calendar size={14} />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="upcoming-event-detail">
                    <Clock size={14} />
                    <span>{event.time}</span>
                  </div>
                  <div className="upcoming-event-detail">
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                </div>
                <p className="upcoming-event-description">{event.description}</p>
                <p className="upcoming-event-cta">Click to get involved →</p>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleEventClick}
            className="upcoming-events-button"
          >
            Get Involved with All Events
          </button>
        </div>
      </div>
    </div>
  );
});

export default UpcomingEvents;