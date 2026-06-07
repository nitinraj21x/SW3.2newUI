import React from 'react';
import { Users, Heart, Globe, Zap, MessageCircle } from 'lucide-react';
import Reveal from '../shared/Reveal';
import FeatureCard from './FeatureCard';

const ObjectivesSection = React.memo(() => {
  return (
    <section id="objectives" className="objectives-section">
      <div className="section-container">
        {/* Section header - more compact design */}
        <div className="section-header">
          <Reveal>
            <h2 className="section-title">Core Objectives</h2>
          </Reveal>
        </div>
        
        {/* Redesigned layout - using flexbox for perfect centering */}
        <div className="objectives-grid">
          {/* Each objective card with enhanced visual hierarchy */}
          <Reveal delay={0}>
            <div className="card hover-cyan">
              <div className="card-iconDesc">
                <div className="card-icon cyan">
                  <Users className="card-icon-svg" />
                </div>
                <div className="card-title">Fostering Connection</div>
              </div>
              <p className="card-description">Creating meaningful relationships through shared experiences and genuine conversations.</p>
            </div>
          </Reveal>
          
          <Reveal delay={200}>
            <div className="card hover-purple">
              <div className="card-iconDesc">
              <div className="card-icon purple">
                <Heart className="card-icon-svg" />
              </div>
              <h3 className="card-title">Building Empathy</h3>
              </div>
              <p className="card-description">Developing deeper understanding and compassion for diverse perspectives and experiences.</p>
            </div>
          </Reveal>
          
          <Reveal delay={300}>
            <div className="card hover-blue">
              <div className="card-iconDesc">
              <div className="card-icon blue">
                <Globe className="card-icon-svg" />
              </div>
              <h3 className="card-title">Strengthening Communities</h3>
              </div>
              <p className="card-description">Building resilient local networks that support collective growth and mutual aid.</p>
            </div>
          </Reveal>
          
          <Reveal delay={400}>
            <div className="card hover-yellow">
              <div className="card-iconDesc">
              <div className="card-icon yellow">
                <Zap className="card-icon-svg" />
              </div>
              <h3 className="card-title">Empowering Individuals</h3>
              </div>
              <p className="card-description">Providing tools and support for personal development and self-advocacy.</p>
            </div>
          </Reveal>
          
          <Reveal delay={500}>
            <div className="card hover-green">
              <div className="card-iconDesc">
              <div className="card-icon green">
                <MessageCircle className="card-icon-svg" />
              </div>
              <h3 className="card-title">Creating Safe Spaces</h3>
              </div>
              <p className="card-description">Establishing environments where vulnerability and authentic expression are welcomed.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
});

export default ObjectivesSection;