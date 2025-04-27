'use client';

import { useEffect, useState } from 'react';
import AnimatedLogo from './animated-logo';
import { motion } from 'framer-motion';
import '@/styles/mobile-blocker.css';

export default function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewportHeight, setViewportHeight] = useState('100vh');
  
  useEffect(() => {
    // Set mounted to handle hydration correctly
    setMounted(true);
    
    // Function to set the real viewport height for mobile devices
    const setRealViewportHeight = () => {
      // iOS Safari workaround - get real viewport height
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setViewportHeight(`${window.innerHeight}px`);
    };
    
    // Check if the device is mobile - use both width and user agent
    const checkMobile = () => {
      // Check if under 768px OR mobile device regardless of orientation
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isSmallScreen = window.innerWidth < 768;
      
      // Always block on mobile devices, regardless of orientation or screen size
      const mobileCheck = isMobileDevice || isSmallScreen;
      
      setIsMobile(mobileCheck);
      
      // Lock or unlock body scroll based on mobile detection
      if (mobileCheck) {
        // Set real viewport height for mobile
        setRealViewportHeight();
        
        // Lock body scroll - multiple approaches for different browsers
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = '0';
        document.body.style.left = '0';
      } else {
        // Restore normal scrolling
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.body.style.left = '';
      }
    };
    
    // Check on initial load
    checkMobile();
    setRealViewportHeight();
    
    // Add event listeners
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', setRealViewportHeight);
    window.addEventListener('orientationchange', checkMobile);
    window.addEventListener('orientationchange', setRealViewportHeight);
    
    // Clean up event listener and restore scrolling
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', setRealViewportHeight);
      window.removeEventListener('orientationchange', checkMobile);
      window.removeEventListener('orientationchange', setRealViewportHeight);
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.left = '';
    };
  }, []);
  
  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) return null;
  
  // If not mobile, don't render the blocker
  if (!isMobile) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-black to-purple-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
      style={{ 
        height: viewportHeight,
        minHeight: viewportHeight,
        maxHeight: viewportHeight
      }}
    >
      {/* Background particles - simplified */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-purple-500/20"
            initial={{ 
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.5
            }}
            animate={{ 
              y: [
                Math.random() * 100 + '%',
                Math.random() * 100 + '%',
                Math.random() * 100 + '%'
              ],
              x: [
                Math.random() * 100 + '%',
                Math.random() * 100 + '%',
                Math.random() * 100 + '%'
              ]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: Math.random() * 10 + 10,
              ease: "linear"
            }}
            style={{
              width: Math.random() * 30 + 10 + 'px',
              height: Math.random() * 30 + 10 + 'px',
            }}
          />
        ))}
      </div>
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <AnimatedLogo />
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-3">
          Mobile Not Supported
        </h2>
        <p className="text-gray-300 text-sm">
          Please visit on desktop to use SolHype
        </p>
      </motion.div>
    </div>
  );
}