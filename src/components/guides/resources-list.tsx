'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const resources = [
  {
    id: 'solana-docs',
    title: 'Solana Documentation',
    description: 'Official documentation for the Solana blockchain.',
    icon: (
      <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    url: 'https://docs.solana.com/',
  },
  {
    id: 'raydium-docs',
    title: 'Raydium DEX Guide',
    description: 'Learn how to use Raydium DEX to create liquidity pools.',
    icon: (
      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    url: 'https://raydium.gitbook.io/raydium/',
  },
  {
    id: 'token-marketing',
    title: 'Token Marketing Strategies',
    description: 'Learn effective marketing strategies for your new token.',
    icon: (
      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    url: 'https://solana.com/developers',
  },
  {
    id: 'community-building',
    title: 'Building a Token Community',
    description: 'Guide to building and growing your token community.',
    icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    url: 'https://solana.com/ecosystem',
  },
];

export default function ResourcesList() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-8">External Resources</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((resource, index) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="h-full"
          >
            <Link 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block bg-[#171717] rounded-xl p-4 shadow-lg border border-gray-800 hover:border-purple-500/30 transition-all h-full"
            >
              <div className="flex items-start h-full">
                <div className="flex-shrink-0 bg-opacity-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-3 rounded-lg mr-4">
                  {resource.icon}
                </div>
                
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-1">{resource.title}</h3>
                  <p className="text-gray-400 text-sm">{resource.description}</p>
                </div>
                
                <div className="ml-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-10 p-4 bg-[#171717] rounded-xl border border-gray-800">
        <p className="text-gray-400 text-center">
          Need more help? Join our <a href="https://discord.gg/solana" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-400 underline">Discord community</a> for support and updates.
        </p>
      </div>
    </div>
  );
}