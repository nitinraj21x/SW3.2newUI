import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import Reveal from '../shared/Reveal';
import RegistrationModal from './RegistrationModal';
import ProtectedImage from '../shared/ProtectedImage';

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
import feb26 from '../../image/2026/Feb/feb26.jpg';

const EventsSection = React.memo(() => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [showAllPastEvents, setShowAllPastEvents] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [selectedEventForRegistration, setSelectedEventForRegistration] = useState(null);

  // Upcoming Events
  const upcomingEvents = [
    {
      id: 'upcoming-1',
      name: "☕ Sewing Circle Coffee Meetup – Bringing IT Professionals Together ",
      date: "April 25",
      time: "4 pm",
      venue: "https://share.google/ZeydqxaTM6jRCXA0f",
      description: "We’re excited to host our next Sewing Circle Coffee Meetup on April 25th in Frisco, TX.\n\nSewing Circle is a growing community of IT professionals built on the idea of coming together to support one another—through knowledge sharing, meaningful conversations, and genuine connections. \n\nThis meetup is an opportunity to:\n*Learn from each other’s experiences\n* Build a strong, supportive network\n* Open doors for others in the IT community \n* Enjoy an evening of authentic conversations "
    }
  ];

  // Past Events data (ordered from latest to oldest)
  const pastEvents = [
    {
      id: 'past-6',
      header: "February 2026",
      theme: "Nine minds, one table, and AI",
      teaser: "Nine minds, one table, and a deep dive into how AI is reshaping everything from code to careers.",
      fullDescription: "Kicked Off 2026 with Insightful Conversations !!!\n\nWe had an intimate group of nine professionals from across the IT ecosystem — hands-on data engineers, a technical project manager, an engineering manager overseeing cybersecurity programs, IoT specialists, and seasoned recruitment experts. The diversity in expertise made the discussion incredibly rich.\n\nWhat began with introductions quickly evolved into a deep dive into how organizations are navigating the AI wave.\n\nWe explored:\n	•	How companies are adapting to AI across the lifecycle — from sales to delivery\n•	The way AI tools are documenting client meetings and generating insights\n•	How AI agents are assisting developers in day-to-day coding and driving cost efficiencies\n•	Healthy debates on whether human-led coding will always remain essential\n•	Reflections on how programming languages have evolved over time — from assembly to modern Java ecosystems\n•	The pace of AI adoption across industries, particularly in financial institutions balancing innovation with security controls\n•	How recruiting is being reshaped by AI — from candidate screening to ensuring authenticity in a competitive job market\n•	Insights from AI summits currently taking place in India\n\nThere were also honest conversations about the current job market and how both companies and candidates are adapting to a rapidly shifting landscape. ",
      location: "Haraz Coffee House, Frisco",
      duration: "2 hours",
      participants: 9,
      facilitator: "Asha",
      coverImage: feb26,
      gallery: [feb26]
    },
    {
      id: 'past-5',
      header: "December 2025",
      theme: "Celebrating Connections and Passions",
      teaser: "Twelve participants connected over digital transformation, AI trends, and personal passions, fostering support and meaningful dialogue.",
      fullDescription: "The December Sewing Circle brought together 12 professionals for conversation, collaboration, and reflection. Discussions ranged from digital transformation in government and healthcare to AI trends including Physical AI and AGI, and emerging investment ideas.\n\nBeyond technology, attendees shared personal passions—from music composition and DJing to crafts, app development, and fashion—creating genuine encouragement and support. The gathering highlighted Sewing Circle's role as a space for growth, inspiration, and human connection.",
      location: "Heritage Coffee, Frisco",
      duration: "2 hours",
      participants: 12,
      facilitator: "Asha",
      coverImage: dec1,
      gallery: [dec1, dec2]
    },
    {
      id: 'past-4',
      header: "October 2025",
      theme: "Navigating AI, Education, and the Future of Work",
      teaser: "Professionals examined AI's impact on work, Gen Alpha's education shifts, fractional roles, and preparing graduates for the future.",
      fullDescription: "The October Sewing Circle gathered professionals from technology, healthcare, HR, and other domains for a thought-provoking evening. Key topics included AI's impact on job markets, evolving organizational structures, Gen Alpha's approach to education, rising tuition costs, and the trend of fractional roles for senior professionals.\n\nParticipants also discussed preparing fresh graduates for the workforce and how AI is transforming operational layers. The meetup emphasized meaningful human connection alongside professional insights.",
      location: "Haraz Coffee House, Plano",
      duration: "2 hours",
      participants: 8,
      facilitator: "Asha",
      coverImage: oct1,
      gallery: [oct1, oct2, oct3]
    },
    {
      id: 'past-3',
      header: "June 2025",
      theme: "Exploring AI, Cybersecurity, and Industry Insights",
      teaser: "Discussions spanned AI, cybersecurity, healthcare applications, virtual assistants, and legacy systems, with lighter conversations adding fun.",
      fullDescription: "The June Sewing Circle welcomed nine participants for an evening of engaging conversation and collaboration. Discussions included AI-driven exposure management, real-world AI use cases across cybersecurity, healthcare, manufacturing, and customer service, prompt engineering, virtual assistants in healthcare, and the enduring role of AS400 in enterprise systems.\n\nLighter conversations on movies, luxury car rivalries, and cultural reflections added fun and variety. Attendees left with valuable industry insights and a sense of community.",
      location: "La Souq, Richardson",
      duration: "2 hours",
      participants: 9,
      facilitator: "Asha",
      coverImage: june1,
      gallery: [june1, june2]
    },
    {
      id: 'past-2',
      header: "April 2025",
      theme: "Tech Insights and Industry Exchange",
      teaser: "IT professionals shared insights on Oracle, NetSuite, SAP, and the intersection of reinsurance with technology.",
      fullDescription: "The April Sewing Circle marked the community's second gathering, bringing IT professionals together for focused, insight-driven conversations. Discussions covered rising Oracle costs, the evolving role of NetSuite, new SAP tools for data visibility, and an eye-opening exploration of reinsurance and its intersection with technology.\n\nThe meetup fostered knowledge-sharing and professional exchange, offering participants fresh perspectives and the opportunity to connect with like-minded peers.",
      location: "Brass Tap, Allen",
      duration: "2 hours",
      participants: 12,
      facilitator: "Asha",
      coverImage: april1,
      gallery: [april1, april2, april3]
    },
    {
      id: 'past-1',
      header: "February 2025",
      theme: "Thoughtful Conversations, Shared Perspectives",
      teaser: "Eleven participants explored AI, testing, workplace culture, and learning mindsets in an afternoon of thoughtful conversation.",
      fullDescription: "The February Sewing Circle brought together eleven individuals for an afternoon of open and engaging conversation. Participants explored topics including the evolving role of UI/UX and manual testing in an AI-driven world, workplace culture, identity beyond job titles, and learning mindsets.\n\nDiverse perspectives sparked reflection, discussion, and meaningful dialogue. Attendees left with new insights and connections, capturing the essence of Sewing Circle as a space for curiosity, learning, and human connection.",
      location: "Brass Tap, Plano",
      duration: "2 hours",
      participants: 11,
      facilitator: "Asha",
      coverImage: feb1,
      gallery: [feb1, feb2]
    }
  ];

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedEvent) return;
      
      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          prevGalleryImage();
          break;
        case 'ArrowRight':
          nextGalleryImage();
          break;
        default:
          break;
      }
    };

    if (selectedEvent) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [selectedEvent]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setCurrentGalleryIndex(0);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setCurrentGalleryIndex(0);
  };

  const nextGalleryImage = () => {
    if (selectedEvent && selectedEvent.gallery) {
      setCurrentGalleryIndex((prev) => 
        prev === selectedEvent.gallery.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevGalleryImage = () => {
    if (selectedEvent && selectedEvent.gallery) {
      setCurrentGalleryIndex((prev) => 
        prev === 0 ? selectedEvent.gallery.length - 1 : prev - 1
      );
    }
  };

  const toggleShowAllPastEvents = () => {
    setShowAllPastEvents(!showAllPastEvents);
  };

  // Get events to display based on showAllPastEvents state
  const eventsToDisplay = showAllPastEvents ? pastEvents : pastEvents.slice(0, 2);

  const handleRegister = (event) => {
    setSelectedEventForRegistration(event);
    setIsRegistrationOpen(true);
  };

  const closeRegistrationModal = () => {
    setIsRegistrationOpen(false);
    setSelectedEventForRegistration(null);
  };

  return (
    <section id="events" className="events-section">
      <div className="section-container">
        <div className="section-header">
          <Reveal>
            <h2 className="section-title">Events</h2>
            <p className="section-subtitle">Join our community gatherings and activities</p>
          </Reveal>
        </div>
        
        {/* Upcoming Events Subsection */}
        <div className="events-subsection">
          <Reveal>
            <h3 className="events-subsection-title">Upcoming Events</h3>
          </Reveal>
          
          <div className="upcoming-events-grid">
            {upcomingEvents.map((event, index) => (
              <Reveal key={event.id} delay={100 * (index + 1)}>
                <div className="upcoming-event-card">
                  <div className="upcoming-event-header">
                    <h4 className="upcoming-event-title">{event.name}</h4>
                    <div className="upcoming-event-meta">
                      <div className="upcoming-event-meta-item">
                        <Calendar size={16} />
                        <span>{event.date}</span>
                      </div>
                      <div className="upcoming-event-meta-item">
                        <Clock size={16} />
                        <span>{event.time}</span>
                      </div>
                      <div className="upcoming-event-meta-item">
                        <MapPin size={16} />
                        <a 
                          href={event.venue} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="venue-link"
                        >
                          View Location <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="upcoming-event-description">
                    {event.description.split('\n\n').map((paragraph, pIndex) => (
                      <p key={pIndex}>{paragraph}</p>
                    ))}
                  </div>
                  
                  <button 
                    className="register-button"
                    onClick={() => handleRegister(event)}
                  >
                    Register
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Past Events Subsection */}
        <div className="events-subsection">
          <Reveal>
            <h3 className="events-subsection-title">Past Events</h3>
            <p className="events-subsection-subtitle">Sewing Circle Event Gallery </p>
          </Reveal>
          
          <div className={`past-events-grid ${showAllPastEvents ? 'expanded' : 'limited'}`}>
            {eventsToDisplay.map((event, index) => (
              <Reveal key={event.id} delay={100 * (index + 1)}>
                <div className="past-event-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  {/* Protected background image */}
                  <ProtectedImage
                    src={event.coverImage}
                    alt={event.header}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
                  />
                  {/* Dark gradient overlay */}
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6))',
                    pointerEvents: 'none',
                  }} />
                  <div className="past-event-overlay" style={{ position: 'relative', zIndex: 2 }}>
                    <h4 className="past-event-title">{event.header}</h4>
                    <div className="past-event-meta">
                      <div className="past-event-meta-item">
                        <Users size={16} />
                        <span>{event.participants} participants</span>
                      </div>
                      <div className="past-event-meta-item">
                        <MapPin size={16} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <button className="read-more-button" onClick={() => handleEventClick(event)}>
                      Read More
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
            
            {/* View All Events Button Card */}
            {!showAllPastEvents && (
              <Reveal delay={100 * (eventsToDisplay.length + 1)}>
                <div className="view-all-events-card">
                  <div className="view-all-content">
                    <h4 className="view-all-title">View All Events</h4>
                    <p className="view-all-subtitle">Explore our complete event history</p>
                    <button 
                      className="view-all-button"
                      onClick={toggleShowAllPastEvents}
                    >
                      View All ({pastEvents.length} Events)
                    </button>
                  </div>
                </div>
              </Reveal>
            )}
            
            {/* Show Less Button when expanded */}
            {showAllPastEvents && (
              <Reveal delay={100 * (pastEvents.length + 1)}>
                <div className="view-all-events-card">
                  <div className="view-all-content">
                    <h4 className="view-all-title">Show Less</h4>
                    <p className="view-all-subtitle">Return to summary view</p>
                    <button 
                      className="view-all-button"
                      onClick={toggleShowAllPastEvents}
                    >
                      Show Less
                    </button>
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="event-modal-overlay" onClick={closeModal}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>
              ×
            </button>
            
            <div className="modal-content-split">
              {/* Left Side - Event Details */}
              <div className="modal-left">
                <div className="modal-header">
                  <h2 className="modal-title">{selectedEvent.header}</h2>
                  <p className="modal-theme">{selectedEvent.theme}</p>
                </div>

                <div className="modal-details">
                  <div className="modal-description">
                    <h3>About This Event</h3>
                    <p>{selectedEvent.fullDescription}</p>
                  </div>

                  <div className="modal-info-grid">
                    <div className="modal-info-item">
                      <h4>Location</h4>
                      <p>{selectedEvent.location}</p>
                    </div>
                    <div className="modal-info-item">
                      <h4>Duration</h4>
                      <p>{selectedEvent.duration}</p>
                    </div>
                    <div className="modal-info-item">
                      <h4>Participants</h4>
                      <p>{selectedEvent.participants} members</p>
                    </div>
                    <div className="modal-info-item">
                      <h4>Facilitator</h4>
                      <p>{selectedEvent.facilitator}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Image Gallery */}
              <div className="modal-right">
                <div className="modal-gallery">
                  <div className="gallery-main-image" style={{ position: 'relative' }}>
                    <ProtectedImage
                      src={selectedEvent.gallery[currentGalleryIndex]}
                      alt={`${selectedEvent.header} - Image ${currentGalleryIndex + 1}`}
                      style={{ width: '100%', height: '100%', borderRadius: 8 }}
                    />
                    {selectedEvent.gallery.length > 1 && (
                      <>
                        <button className="gallery-nav gallery-prev" onClick={prevGalleryImage} style={{ zIndex: 10 }}>‹</button>
                        <button className="gallery-nav gallery-next" onClick={nextGalleryImage} style={{ zIndex: 10 }}>›</button>
                      </>
                    )}
                  </div>
                  
                  {selectedEvent.gallery.length > 1 && (
                    <div className="gallery-controls">
                      <div className="gallery-radio-buttons">
                        {selectedEvent.gallery.map((image, index) => (
                          <label key={index} className="gallery-radio-item">
                            <input
                              type="radio"
                              name="gallery-image"
                              className="gallery-radio-input"
                              checked={index === currentGalleryIndex}
                              onChange={() => setCurrentGalleryIndex(index)}
                            />
                          </label>
                        ))}
                      </div>
                      <div className="gallery-counter">
                        {currentGalleryIndex + 1} of {selectedEvent.gallery.length}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={isRegistrationOpen}
        onClose={closeRegistrationModal}
        eventName={selectedEventForRegistration?.name}
      />
    </section>
  );
});

export default EventsSection;