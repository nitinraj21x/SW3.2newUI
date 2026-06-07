import React from 'react';
import Reveal from '../shared/Reveal';
import feb1 from '../../image/backgrounds/abtUsImg.jpg';

const AboutSection = React.memo(() => {
  return (
    <section id="about" className="about-section">
      <div className="section-container">
        <div className="section-header">
          <Reveal>
            <h2 className="section-title">About Us</h2>
            <p className="section-subtitle">Weaving individuals back together in a digital world</p>
          </Reveal>
        </div>
        
        <div className="about-content">
          <Reveal className='abt-content'>
            <div className="about-text-content">
              <div className="about-text">
                <p>
                  In a world dominated by rapid digital transactions, the art of genuine human connection is fading. The Sewing Circle is a counter-movement—an initiative dedicated to weaving individuals back together.
                </p>
                <p>
                  During the turbulent times of World War 2, a traditional sewing circle brought people together to create and mend. We are creating modern spaces for empathy, support, and collaborative growth. We believe that every conversation is a thread that strengthens the fabric of our society.
                </p>
                <p>
                  The Sewing Circle is more than just an idea; it is a movement that aims to build communities, one small connection at a time. At its core, the initiative is centered around creating a supportive environment where individuals can engage in meaningful conversations, share their diverse perspectives, and form lasting relationships. The project's name itself evokes the warmth and connection inherent in the tradition of sewing circles—spaces where people came together to create, share, and grow.
                </p>
                {/* Hashtag-style tags for key concepts */}
                <div className="about-tags">
                  <span className="about-tag cyan">#HumanConnection</span>
                  <span className="about-tag purple">#CommunityGrowth</span>
                  <span className="about-tag blue">#Empathy</span>
                  <span className="about-tag green">#AuthenticConversations</span>
                </div>
              </div>
            </div>
          </Reveal>
          
          <Reveal delay={200} className='abt-img'>
            <div className="about-image-content">
              <img 
                src={feb1} 
                alt="Sewing Circle community gathering" 
                className="about-image"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
});

export default AboutSection;