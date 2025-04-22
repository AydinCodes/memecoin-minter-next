'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-900 to-blue-900">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center px-4"
      >
        <h2 className="text-4xl font-bold text-white mb-6">Ready to Launch Your Token?</h2>
        <p className="text-gray-300 mb-8">
          Join hundreds of creators using SolMinter to bring their projects to life.
        </p>
        <Link
          href="/create-token"
          className="bg-white text-black font-semibold py-3 px-8 rounded-full hover:shadow-xl transition"
        >
          Get Started Now
        </Link>
      </motion.div>
    </section>
  );
}