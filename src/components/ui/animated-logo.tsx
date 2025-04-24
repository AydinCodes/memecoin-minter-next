// src/components/ui/animated-logo.tsx

'use client';

import { useState } from 'react';

export default function AnimatedLogo() {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="relative transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transform: 'translateZ(0)' }} // Force hardware acceleration
    >
      <svg
        width="165.47363mm"
        height="34.556458mm"
        viewBox="0 0 165.47363 34.556458"
        version="1.1"
        className={`transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
        style={{ width: '120px', height: 'auto', transformOrigin: 'center center' }}
      >
        <defs>
          {/* Sol gradient - using purple shades from your site */}
          <linearGradient
            id="solGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
            gradientTransform="rotate(25)"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={isHovered ? "#a855f7" : "#c026d3"} />
            <stop offset="100%" stopColor={isHovered ? "#8b5cf6" : "#9333ea"} />
          </linearGradient>
          
          {/* Hype gradient - using blue shades from your site */}
          <linearGradient
            id="hypeGradient"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
            gradientTransform="rotate(25)"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={isHovered ? "#3b82f6" : "#2563eb"} />
            <stop offset="100%" stopColor={isHovered ? "#06b6d4" : "#0ea5e9"} />
          </linearGradient>
          
          {/* Flame gradient for the Solana icon */}
          <linearGradient
            id="flameGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={isHovered ? "#a855f7" : "#9333ea"} />
            <stop offset="100%" stopColor={isHovered ? "#3b82f6" : "#2563eb"} />
          </linearGradient>
          
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={isHovered ? "2" : "0"} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <g transform="translate(-15.063086,-114.95612)" filter={isHovered ? "url(#glow)" : ""}>
          {/* Group both text elements to ensure they transform together */}
          <g className="text-group">
            <text
              x="42.501293"
              y="143.72714"
              style={{ 
                fontStyle: 'normal',
                fontVariant: 'normal',
                fontWeight: 'bold',
                fontStretch: 'normal',
                fontSize: '35.2778px',
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fill: 'url(#solGradient)',
                strokeWidth: '0.264583'
              }}
            >
              <tspan x="42.501293" y="143.72714">Sol</tspan>
            </text>
            <text
              x="95.309776"
              y="143.72714" // Fixed Y position to match Sol text exactly
              style={{ 
                fontStyle: 'normal',
                fontVariant: 'normal',
                fontWeight: 'bold',
                fontStretch: 'normal',
                fontSize: '35.2777px',
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                fill: 'url(#hypeGradient)',
                strokeWidth: '0.264583'
              }}
            >
              <tspan x="95.309776" y="143.72714">Hype</tspan>
            </text>
          </g>
          
          {/* Solana flame icon */}
          <g transform="matrix(0.08043674,0,0,0.08043674,11.7725,115.8394)">
            <path
              d="m 160.109,182.619 c 0.8,6.8 -6,11.6 -12,8 -22,-12.8 -32.8,-36.4 -47.2,-56.8 -23.2,36.8 -40.8,72.4 -40.8,110.4 0,77.2 54.8,136 132,136 77.2,0 136,-58.8 136,-136 0,-96.8 -101.2,-113.6 -100,-236 -40.8,28.8 -79.2,93.2 -68,174.4 z"
              fill="url(#flameGradient)"
              className="transition-all duration-500"
              style={{
                filter: isHovered ? "brightness(1.2)" : "none",
              }}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}