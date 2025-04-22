'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Enhanced particle background effect
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];
    
    const createParticles = () => {
      particles = Array.from({ length: 120 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 50 + 50)}, ${Math.floor(Math.random() * 200 + 55)}, ${Math.random() * 0.2 + 0.1})`
      }));
    };
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };
    
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Boundary check with smoother transition
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative text-center px-4 pt-10 md:pt-0 z-10"
      >
        <motion.h1 
          className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-500 via-purple-400 to-blue-500 bg-clip-text text-transparent"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Create Solana Tokens In Seconds
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-6 text-gray-300 text-lg md:text-xl max-w-2xl mx-auto"
        >
          The easiest way to mint, launch, and manage tokens on the Solana blockchain.
          No coding required.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href="/create-token"
            className="bg-gradient-to-r from-purple-600 to-blue-500 py-4 px-8 rounded-full text-white font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            Create Your Token
          </Link>
          <Link
            href="/guides"
            className="border border-purple-500 py-4 px-8 rounded-full text-purple-400 font-medium hover:bg-purple-500/10 transition-all"
          >
            Learn How It Works
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 text-gray-500 text-sm"
        >
          Trusted by hundreds of token creators on Solana
        </motion.div>
      </motion.div>
    </section>
  );
}