import React from 'react';
import { Sparkles } from 'lucide-react';
import Reveal from '../shared/Reveal';
import connectionsVideo from '../../Videos/connections.mp4';

const FutureSection = React.memo(() => {
  return (
    <section id="future" className="future-section">
      <div className="section-container future-inner">
        {/* Left: text content */}
        <Reveal className="future-text-col">
          <div className="section-header">
            <h2 className="section-title">Our Direction</h2>
          </div>
          <p className="future-heading">
            To evolve into a collaborative platform that connects professionals, fosters knowledge sharing, and enables meaningful career growth through community-driven support.
          </p>
          <div className="future-punchline">
            <Sparkles className="future-punchline-icon" />
            <p>Transforming connections into opportunities and support into success.</p>
          </div>
        </Reveal>

        {/* Right: video */}
        <Reveal delay={200} className="future-image-col">
          <div className="future-video-wrap">
            <video
              src={connectionsVideo}
              autoPlay
              loop
              muted
              playsInline
              className="future-video"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
});

export default FutureSection;
