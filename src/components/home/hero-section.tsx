'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Simple particle background effect
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles: { x: number; y: number; vx: number; vy: number; }[] = [];
    const createParticles = () => {
      particles = Array.from({ length: 100 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
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
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative text-center px-4"
      >
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Launch Your Solana Token Today
        </h1>
        <p className="mt-4 text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
          Create, launch, and manage Solana tokens effortlessly with SolMinter.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/create-token"
            className="bg-gradient-to-r from-purple-600 to-blue-500 py-3 px-8 rounded-full text-white hover:shadow-lg transition"
          >
            Create Token
          </Link>
          <Link
            href="/guides"
            className="border border-purple-500 py-3 px-8 rounded-full text-purple-500 hover:bg-purple-500 hover:text-white transition"
          >
            Learn More
          </Link>
        </div>
      </motion.div>
    </section>
  );
}