import React from 'react';
import { Activity } from 'lucide-react';
import Reveal from '../shared/Reveal';
import visionBg from '../../image/backgrounds/visionBg.png';

const VisionSection = React.memo(() => {
  return (
    <section 
      id="vision" 
      className="vision-section"
      style={{
        backgroundImage: `url(${visionBg})`
      }}
    >
      <div className="vision-overlay"></div>
      <div className="vision-content">
        <Reveal>
          {/* Section icon */}
          <Activity className="vision-icon" />
          <h2 className="section-title">Vision</h2>
          
          {/* Vision statement - comprehensive long-term goals */}
          <p className="vision-description">
            The Sewing Circle is not just a short-term initiative—it is a long-term movement designed to create a lasting impact. While the project may begin as small gatherings or community meetups, its potential to grow and inspire widespread change is limitless. The long-term vision for the Sewing Circle is to create a national network of interconnected communities, each fostering its own local bonds while contributing to the larger social fabric of society.
          </p>
          <p className="vision-description">
            Through its focus on small acts of kindness and collaborative action, the project aims to generate meaningful change in both personal and collective spheres. The Sewing Circle envisions a future where individuals feel supported, seen, and heard—not just in their professional lives, but in their personal, emotional, and social lives as well.
          </p>
        </Reveal>
        
        {/* Impact statistics - visual representation of growth */}
        <Reveal delay={200}>
          <div className="vision-stats">
            <div>
              <div className="vision-stat-number">250+</div>
              <div className="vision-stat-label">Community Members</div>
            </div>
            <div>
              <div className="vision-stat-number">10+</div>
              <div className="vision-stat-label">Gatherings</div>
            </div>
            <div>
              <div className="vision-stat-number">INFINITE</div>
              <div className="vision-stat-label">Possibilities</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
});

export default VisionSection;