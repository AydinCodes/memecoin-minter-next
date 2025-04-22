'use client';
import { motion } from 'framer-motion';

const steps = [
  { number: 1, title: 'Upload Logo', description: 'Add your token logo and details.' },
  { number: 2, title: 'Configure Options', description: 'Set authorities, socials, and creator info.' },
  { number: 3, title: 'Review & Launch', description: 'Confirm & approve transaction in your wallet.' },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <motion.div
              key={s.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[#171717] p-6 rounded-2xl shadow-lg"
            >
              <div className="text-purple-500 text-2xl font-bold mb-4">{s.number}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-gray-400">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}