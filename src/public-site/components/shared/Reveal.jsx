import { useState, useEffect, useRef } from 'react';

const useScrollReveal = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    }, { threshold });

    const currentElement = domRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  return [domRef, isVisible];
};

const Reveal = ({ children, className = "", delay = 0 }) => {
  const [ref, isVisible] = useScrollReveal();
  
  return (
    <div
      ref={ref}
      className={`reveal-container ${className} ${
        isVisible ? 'reveal-visible' : 'reveal-hidden'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default Reveal;