'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function TokenCountSection() {
  const [count, setCount] = useState(0);
  
  // Simulate a count-up animation for demonstration
  useEffect(() => {
    const targetCount = 1250; // Example number of tokens created
    const duration = 2000; // 2 seconds
    const step = targetCount / (duration / 16); // 60fps
    let current = 0;
    
    const timer = setInterval(() => {
      current += step;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-[#171717] rounded-2xl p-8 shadow-lg border border-gray-800 text-center"
        >
          <h2 className="text-2xl font-semibold text-white mb-2">Trusted by Solana Creators</h2>
          <p className="text-gray-400 mb-8">Join our growing community of token creators</p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex-1">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                {count.toLocaleString()}+
              </div>
              <div className="text-gray-400 mt-2">Tokens Created</div>
            </div>
            
            <div className="h-16 w-px bg-gray-800 hidden md:block"></div>
            
            <div className="flex-1">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                100%
              </div>
              <div className="text-gray-400 mt-2">Client Satisfaction</div>
            </div>
            
            <div className="h-16 w-px bg-gray-800 hidden md:block"></div>
            
            <div className="flex-1">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500">
                Easy
              </div>
              <div className="text-gray-400 mt-2">Token Creation</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}