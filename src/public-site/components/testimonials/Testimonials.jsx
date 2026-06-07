import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import Reveal from '../shared/Reveal';

const testimonials = [
  {
    id: 1,
    name: "Madan R",
    role: "Technology Business Executive",
    content: "The Sewing Circle provides a great forum for meaningful dialogue and relationship-building. Participation has enabled substantive exchange of insights from technology to business to society with diverse individuals. Looking forward to see this community growing in 2026 and beyond"
  },
  {
    id: 2,
    name: "Kranthikumar Sivapuram",
    role: "Engagement Partner",
    content: "This forum has reminded me how valuable genuine networking can be. The sewing circle concept creates a comfortable space for IT consultants to share industry insights, real experiences, and new ideas. When life gets busy and networking slips to the back burner, this feels like a refreshing and much-needed reset."
  },
  {
    id: 3,
    name: "Venkatesh Narayan",
    role: "Senior CX Transformation Lead",
    content: "Through SewingCircle, I personally connected with professionals from different IT companies in a relaxed, happy-hour setting. These genuine conversations helped me build meaningful relationships, better understand the job market, and gain insights I wouldn't have found through traditional networking. Those connections directly opened doors for me and ultimately helped me land a job. SewingCircle feels less like a meetup and more like a supportive community that fosters real human connections and career growth."
  },
  {
    id: 4,
    name: "Ashok S",
    role: "Director, US Delivery Head",
    content: "SewingCircle feels like something special in the making. As a growing community, it already offers a welcoming space where IT professionals can connect openly, share experiences, and learn from one another without pressure. The conversations are casual yet insightful, and the relationships feel genuine. It's exciting to be part of this journey early and watch it evolve into a strong, trusted network"
  },
  {
    id: 5,
    name: "Shruti Thaduri",
    role: "Senior Project Manager",
    content: "This circle has been an amazing platform to connect, learn, and grow. From sharing ideas on AI and careers to meaningful discussions, it has helped me expand my network and gain fresh perspectives."
  }
];

const TOTAL = testimonials.length;

// Wrap index for infinite loop
const wrap = (index) => ((index % TOTAL) + TOTAL) % TOTAL;

const Testimonials = React.memo(() => {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const autoRef = useRef(null);

  const startAuto = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActive(prev => wrap(prev + 1));
    }, 5000);
  }, []);

  useEffect(() => {
    startAuto();
    return () => clearInterval(autoRef.current);
  }, [startAuto]);

  const go = useCallback((dir) => {
    if (animating) return;
    setAnimating(true);
    setActive(prev => wrap(prev + dir));
    startAuto();
    setTimeout(() => setAnimating(false), 500);
  }, [animating, startAuto]);

  // Returns position offset relative to active: -2, -1, 0, 1, 2
  const getOffset = (index) => {
    let diff = index - active;
    // Wrap to [-TOTAL/2, TOTAL/2]
    if (diff > TOTAL / 2) diff -= TOTAL;
    if (diff < -TOTAL / 2) diff += TOTAL;
    return diff;
  };

  // Only render cards within ±2 of active
  const visibleIndices = [-2, -1, 0, 1, 2].map(o => wrap(active + o));

  return (
    <div className="testimonials-container">
      <div className="section-header">
        <Reveal>
          <h3 className="section-title">Community Voices</h3>
          <p className="testimonials-subtitle">Real experiences from our community members</p>
        </Reveal>
      </div>

      <div className="focal-carousel">
        {/* Nav buttons */}
        <button
          className="focal-nav focal-nav-prev"
          onClick={() => go(-1)}
          aria-label="Previous testimonial"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="focal-track" aria-live="polite">
          {visibleIndices.map((idx) => {
            const offset = getOffset(idx);
            const t = testimonials[idx];
            return (
              <div
                key={t.id}
                className={`focal-card focal-offset-${offset}`}
                aria-hidden={offset !== 0}
                onClick={() => offset !== 0 && go(offset > 0 ? 1 : -1)}
              >
                <Quote className="testimonial-quote-icon" size={28} />
                <div className="testimonial-content">
                  <p className="testimonial-text">"{t.content}"</p>
                </div>
                <div className="testimonial-author">
                  <h4 className="testimonial-name">{t.name}</h4>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="focal-nav focal-nav-next"
          onClick={() => go(1)}
          aria-label="Next testimonial"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="testimonial-indicators">
        {testimonials.map((_, i) => (
          <button
            key={i}
            className={`testimonial-indicator ${i === active ? 'active' : ''}`}
            onClick={() => { if (!animating) { setActive(i); startAuto(); } }}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
});

export default Testimonials;
