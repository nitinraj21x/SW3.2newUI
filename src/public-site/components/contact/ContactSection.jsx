import React from 'react';
import Reveal from '../shared/Reveal';

const ContactSection = React.memo(({ onOpenModal }) => {
  return (
    <section id="contact" className="contact-section">
      {/* Background gradient effects */}
      <div className="contact-bg contact-bg-gradient"></div>
      <div className="contact-bg contact-bg-noise"></div>
      
      {/* Main content */}
      <div className="contact-content">
        <Reveal>
          <h2 className="contact-title">Contact Us</h2>
          <p className="contact-description">
            Want to chat with someone in sewing circle, ask a question, get some support?
          </p>
          <button 
            onClick={onOpenModal}
            className="contact-button"
          >
            Contact Us
          </button>
          <p className="contact-footer">
            and we'll get back to you as soon as we can!
          </p>
        </Reveal>
      </div>
    </section>
  );
});

export default ContactSection;