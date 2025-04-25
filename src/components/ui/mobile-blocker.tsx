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
        
        // Add classes for additional CSS control
        document.documentElement.classList.add('mobile-blocked');
        document.body.classList.add('mobile-blocked');
        
        // Prevent touchmove events
        document.addEventListener('touchmove', preventDefaultTouchMove, { passive: false });
      } else {
        // Restore normal scrolling
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.body.style.left = '';
        
        // Remove classes
        document.documentElement.classList.remove('mobile-blocked');
        document.body.classList.remove('mobile-blocked');
        
        // Remove touchmove prevention
        document.removeEventListener('touchmove', preventDefaultTouchMove);
      }
    };
    
    // Function to prevent default touchmove behavior
    const preventDefaultTouchMove = (e: TouchEvent) => {
      e.preventDefault();
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
      document.removeEventListener('touchmove', preventDefaultTouchMove);
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.documentElement.classList.remove('mobile-blocked');
      document.body.classList.remove('mobile-blocked');
    };
  }, []);
  
  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) return null;
  
  // If not mobile, don't render the blocker
  if (!isMobile) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-black to-purple-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 mobile-blocker-overlay"
      onClick={(e) => e.preventDefault()} // Extra measure to prevent any click events
      onTouchMove={(e) => e.preventDefault()} // Extra measure to prevent touch events
      style={{ 
        height: viewportHeight,
        minHeight: viewportHeight,
        maxHeight: viewportHeight
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => ( // Reduced number of particles for better performance
          <motion.div
            key={i}
            className="absolute rounded-full bg-purple-500/20 mobile-blocker-particle"
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
        className="mb-8"
      >
        <AnimatedLogo />
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#171717] rounded-xl p-8 max-w-md w-full text-center border border-purple-500/30 shadow-lg shadow-purple-500/10"
      >
        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 mobile-icon-pulse">
          <span className="material-symbols-rounded text-purple-400 text-3xl">
            phone_iphone
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Mobile Not Supported
        </h2>
        
        <p className="text-gray-300 mb-6">
          SolHype is currently only available on desktop devices. Please visit us on a computer to create and manage your Solana tokens.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <div className="bg-[#222] p-4 rounded-lg text-purple-400 text-sm flex flex-col items-center device-card desktop-badge">
            <span className="material-symbols-rounded text-2xl mb-2">computer</span>
            <p>Desktop</p>
            <p className="text-green-400 text-xs mt-1">Supported</p>
          </div>
          
          <div className="w-8 h-0.5 bg-gray-700"></div>
          
          <div className="bg-[#222] p-4 rounded-lg text-gray-400 text-sm flex flex-col items-center device-card mobile-badge">
            <span className="material-symbols-rounded text-2xl mb-2">smartphone</span>
            <p>Mobile</p>
            <p className="text-red-400 text-xs mt-1">Not Supported</p>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-8">
          For the full SolHype experience, please use a desktop browser with a minimum screen width of 768px.
        </p>
      </motion.div>
    </div>
  );
}