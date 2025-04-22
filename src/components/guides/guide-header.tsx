'use client';

import { motion } from 'framer-motion';

export default function GuideHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-16"
    >
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
        <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          Guides & Resources
        </span>
      </h1>
      <p className="text-gray-400 text-lg max-w-3xl mx-auto">
        Learn how to create, launch, and manage your Solana tokens with our comprehensive guides and resources. 
        Follow the step-by-step instructions to bring your token project to life.
      </p>
    </motion.div>
  );
}