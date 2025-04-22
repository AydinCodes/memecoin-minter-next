'use client';

import { useEffect, useRef } from 'react';
import '../../styles/checkmark.css';

export default function CheckmarkAnimation() {
  const animationRef = useRef<HTMLDivElement>(null);
  
  // Ensure the animation restarts when component mounts
  useEffect(() => {
    if (animationRef.current) {
      const checkmark = animationRef.current.querySelector('.checkmark') as HTMLElement;
      
      if (checkmark) {
        // Reset animations
        checkmark.style.animation = 'none';
        
        // Force reflow
        void checkmark.offsetWidth;
        
        // Restart animations
        checkmark.style.animation = '';
        
        // SVG elements need a different approach for animation reset
        const svgElements = animationRef.current.querySelectorAll('circle, path');
        svgElements.forEach(el => {
          // Remove and re-add the element to force animation restart
          const parent = el.parentNode;
          if (parent) {
            const clone = el.cloneNode(true);
            parent.removeChild(el);
            setTimeout(() => parent.appendChild(clone), 0);
          }
        });
      }
    }
  }, []);

  return (
    <div className="checkmark-container">
      <div className="success-checkmark" ref={animationRef}>
        <svg 
          className="checkmark" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 52 52"
        >
          <circle 
            className="checkmark__circle" 
            cx="26" 
            cy="26" 
            r="25" 
            fill="none"
          />
          <path 
            className="checkmark__check" 
            fill="none" 
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>
      </div>
    </div>
  );
}