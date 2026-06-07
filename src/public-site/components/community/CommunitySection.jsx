import React from 'react';
import Reveal from '../shared/Reveal';
import Testimonials from '../testimonials/Testimonials';

const CommunitySection = React.memo(() => {
  const communityAreas = [
    {
      id: 1,
      title: 'Discussion Circles & Learning Workshops',
      description: 'Our discussion circles and workshops create a safe, thoughtful space for learning, dialogue, and shared growth. Through guided conversations and interactive sessions, we explore topics such as social responsibility, career development, personal growth, emotional intelligence, and navigating change in today\'s professional world.\n\nThese gatherings are designed to encourage open perspectives, peer learning, and meaningful connections—bringing together people from diverse backgrounds to learn from one another and grow together.',
      colorClass: 'cyan'
    },
    {
      id: 2,
      title: 'Volunteering & Social Impact',
      description: 'At Sewing Circle, we believe strong communities are built by giving back. Our volunteering initiatives enable members to contribute their time, skills, and knowledge toward causes that create meaningful social impact.\n\nFrom mentoring and educational outreach to community service efforts, we work together to support initiatives that uplift individuals and strengthen the communities we are part of.',
      colorClass: 'purple'
    },
    {
      id: 3,
      title: 'Collaborative Projects & Innovation',
      description: 'Collaboration is at the heart of Sewing Circle. We bring members together to ideate, build, and contribute to collaborative projects that address real-world challenges.\n\nThese projects encourage creativity, cross-disciplinary teamwork, and hands-on learning—allowing members to apply their skills, experiment with ideas, and create solutions that benefit both the community and society at large.',
      colorClass: 'blue'
    },
    {
      id: 4,
      title: 'Career Support & Talent Connections',
      description: 'We actively support members navigating career transitions and professional growth. Through peer guidance, referrals, resume sharing, mentorship, and opportunity matching, Sewing Circle serves as a trusted network for career enablement.\n\nWhether someone is exploring new opportunities, re-entering the workforce, or looking to connect with meaningful work, our community helps bridge talent with opportunity through authentic relationships and collective support.',
      colorClass: 'green'
    }
  ];

  return (
    <section id="community" className="community-section">
      <div className="section-container">
        <div className="section-header">
          <Reveal>
            <h2 className="section-title">Community Engagement and Growth</h2>
          </Reveal>
        </div>
        
        {/* Community Areas */}
        <div className="community-areas-grid">
          {communityAreas.map((area, index) => (
            <Reveal key={area.id} delay={100 * (index + 1)}>
              <div className={`community-area ${area.colorClass}`}>
                <h3 className="community-area-title">{area.title}</h3>
                <div className="community-area-description">
                  {area.description.split('\n\n').map((paragraph, pIndex) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="community-testimonials">
          <Testimonials />
        </div>
      </div>
    </section>
  );
});

export default CommunitySection;