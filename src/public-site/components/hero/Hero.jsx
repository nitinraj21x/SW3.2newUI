import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Reveal from '../shared/Reveal';

const Hero = React.memo(() => {
  return (
    <section id="hero" className="hero-section">
      {/* Background Image */}
      <div 
        className="hero-background"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")',
          filter: 'brightness(0.3)'
        }}
      ></div>
      
      {/* Animated Overlay Grid */}
      <div className="hero-overlay"></div>
      
      {/* Glowing Orbs */}
      <div className="hero-orb-1"></div>
      <div className="hero-orb-2"></div>

      <div className="hero-content">
        
        <Reveal delay={200}>
          <h1 className="hero-title">
            WEAVING A <br />
            <span className="hero-title-gradient">
              CONNECTED WORLD
            </span>
          </h1>
        </Reveal>
        
        <Reveal delay={400}>
          <p className="hero-subtitle">
            Restoring genuine human connection in a digital age. We build communities, foster empathy, and create spaces for meaningful growth.
          </p>
          <p className="hero-subtitle">
            Rooted in the IT community, Sewing Circle continues to grow as a diverse network of professionals and changemakers.
          </p>
        </Reveal>
        
        <Reveal delay={600}>
          <div className="hero-cta-container">
            <a href="#vision" className="hero-cta-primary">
              Discover Vision <ArrowRight size={20} className="hero-cta-icon" />
            </a>
            <a href="#contact" className="hero-cta-secondary">
              Join the Circle
            </a>
          </div>
        </Reveal>
      </div>

      <div className="hero-scroll-indicator">
        <ChevronDown size={32} />
      </div>
    </section>
  );
});

export default Hero;