'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  title: string;
  description: string;
}

interface Content {
  title: string;
  description: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  steps?: Step[];
  content?: Content[];
  recommendation?: string;
}

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#171717] rounded-xl p-6 shadow-lg border border-gray-800 hover:border-purple-500/30 transition-all">
      <div 
        className="flex items-start cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-shrink-0 bg-opacity-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-3 rounded-lg mr-4">
          {guide.icon}
        </div>
        
        <div className="flex-grow">
          <h3 className="text-2xl font-semibold text-white mb-2">{guide.title}</h3>
          <p className="text-gray-400">{guide.description}</p>
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <svg 
            className={`w-6 h-6 text-purple-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-6 border-t border-gray-800">
              {guide.steps && (
                <ol className="list-decimal pl-5 space-y-4">
                  {guide.steps.map((step, index) => (
                    <li key={index}>
                      <div className="text-white font-semibold mb-1">{step.title}</div>
                      <p className="text-gray-400">{step.description}</p>
                    </li>
                  ))}
                </ol>
              )}
              
              {guide.content && (
                <ul className="space-y-4">
                  {guide.content.map((item, index) => (
                    <li key={index} className="bg-[#222] p-4 rounded-lg">
                      <div className="text-white font-semibold mb-1">{item.title}</div>
                      <p className="text-gray-400">{item.description}</p>
                    </li>
                  ))}
                </ul>
              )}
              
              {guide.recommendation && (
                <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-300">{guide.recommendation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}