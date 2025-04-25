'use client';

import Head from 'next/head';
import { useEffect, useState } from 'react';

/**
 * Component to add mobile-specific meta tags when viewed on mobile devices
 */
export default function MobileMetaTags() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render during SSR
  if (!mounted) return null;
  
  // Only add the restrictive meta tags on mobile
  if (!isMobile) return null;

  return (
    <Head>
      {/* Prevent zooming */}
      <meta 
        name="viewport" 
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
      />
      {/* Prevent elastic scroll/bounce effect on iOS */}
      <style>{`
        html, body {
          position: fixed;
          overflow: hidden;
          width: 100%;
          height: 100%;
          overscroll-behavior: none;
          touch-action: none;
          -webkit-overflow-scrolling: none;
        }
      `}</style>
    </Head>
  );
}