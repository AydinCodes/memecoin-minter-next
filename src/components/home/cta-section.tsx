'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function CTASection() {
  const particlesRef = useRef<HTMLDivElement>(null);
  
  // Create animated particles when component mounts
  useEffect(() => {
    if (!particlesRef.current) return;
    
    // Clear any existing particles
    while (particlesRef.current.firstChild) {
      particlesRef.current.removeChild(particlesRef.current.firstChild);
    }
    
    // Create new particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      
      // Random styles for each particle
      const size = Math.random() * 20 + 5;
      particle.style.position = 'absolute';
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      particle.style.opacity = `${Math.random() * 0.5}`;
      
      // Animation
      particle.style.animation = `float-particle ${Math.random() * 10 + 10}s linear infinite`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      particlesRef.current.appendChild(particle);
    }
    
    // Add the animation keyframes to the document if they don't exist
    if (!document.getElementById('particle-animation-keyframes')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'particle-animation-keyframes';
      styleElement.textContent = `
        @keyframes float-particle {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(20px);
          }
          75% {
            transform: translateY(10px) translateX(5px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-purple-900/90 to-blue-900/90 relative overflow-hidden">
      {/* Background particle effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div ref={particlesRef} className="absolute top-0 left-0 w-full h-full">
          {/* Particles will be dynamically added here */}
        </div>
      </div>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center px-4 relative z-10"
      >
        <motion.h2 
          className="text-4xl sm:text-5xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Ready to Launch Your Token?
        </motion.h2>
        
        <motion.p 
          className="text-gray-200 text-lg mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Join hundreds of creators who have already launched their tokens on Solana using SolMinter. 
          Start building your project today with just a few clicks.
        </motion.p>
        
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="/create-token"
            className="bg-white text-purple-900 font-semibold py-4 px-8 rounded-full hover:shadow-xl hover:bg-gray-100 transition-all"
          >
            Create Token Now
          </Link>
          
          <Link
            href="/my-tokens"
            className="bg-transparent text-white border border-white font-semibold py-4 px-8 rounded-full hover:bg-white/10 transition-all"
          >
            View My Tokens
          </Link>
        </motion.div>
        
        <motion.div
          className="mt-10 text-sm text-white/60"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Need help? Check out our <Link href="/guides" className="text-white underline hover:text-purple-300">guides and resources</Link>.
        </motion.div>
      </motion.div>
    </section>
  );
}