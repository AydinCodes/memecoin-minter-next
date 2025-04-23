'use client';

import { motion } from 'framer-motion';
import GuideCard from './guide-card';
// Guide data
const guides = [
  {
    id: 'meme-coin-creation',
    title: 'How to Create a Solana Meme Coin',
    description: 'A step-by-step guide to create your own viral meme coin on the Solana blockchain with SolHype.',
    icon: (
      <svg className="w-10 h-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    steps: [
      {
        title: 'Connect Your Wallet',
        description: 'Click the "Connect Wallet" button in the top right corner and connect your Phantom, Solflare, or other compatible Solana wallet.',
      },
      {
        title: 'Fill in Meme Coin Details',
        description: 'Enter your meme coin\'s name, symbol, supply, and other details. Upload a logo image (1000x1000px recommended) to give your meme coin a unique identity.',
      },
      {
        title: 'Configure Token Options',
        description: 'Choose whether to include social links and creator information. Select which authorities to revoke (recommended for investor trust).',
      },
      {
        title: 'Launch Your Meme Coin',
        description: 'Review your meme coin details, then click "Launch Token" and approve the transaction in your wallet. Your meme coin will be created on the Solana blockchain.',
      },
      {
        title: 'Create Liquidity',
        description: 'After creating your meme coin, set up a liquidity pool on Raydium or another Solana DEX to make your token tradable on the open market.',
      },
    ],
  },
  {
    id: 'token-authorities',
    title: 'Token Authorities Explained',
    description: 'Learn about the different types of authorities in Solana meme coins and how they affect your token\'s security and credibility.',
    icon: (
      <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    content: [
      {
        title: 'Mint Authority',
        description: 'Controls the ability to create (mint) new tokens. Revoking this authority creates a fixed supply meme coin that cannot be inflated, building trust with your community.',
      },
      {
        title: 'Freeze Authority',
        description: 'Controls the ability to freeze token accounts, preventing transfers. Revoking this ensures no one can freeze holders\' tokens, increasing security for meme coin investors.',
      },
      {
        title: 'Update Authority',
        description: 'Controls the ability to modify token metadata (name, symbol, image, etc.). Revoking makes the meme coin\'s metadata immutable, preventing future changes.',
      },
    ],
    recommendation: 'For maximum credibility with your meme coin community, we recommend revoking all authorities.',
  },
  {
    id: 'meme-coin-marketing',
    title: 'Marketing Your Meme Coin',
    description: 'Essential strategies to promote your meme coin and build a thriving community.',
    icon: (
      <svg className="w-10 h-10 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    steps: [
      {
        title: 'Build Social Media Presence',
        description: 'Create dedicated social media accounts for your meme coin on Twitter, Telegram, and Discord. Consistently post updates, memes, and community information.',
      },
      {
        title: 'Create a Narrative',
        description: 'Every successful meme coin has a compelling story. Develop a unique narrative around your token that resonates with potential investors.',
      },
      {
        title: 'Leverage Community Power',
        description: 'Encourage community participation through rewards, competitions, and airdrops. Engaged communities are the backbone of successful meme coins.',
      },
      {
        title: 'Partner with Influencers',
        description: 'Collaborate with crypto influencers to increase visibility and credibility. Choose partners whose audience aligns with your target community.',
      },
      {
        title: 'Provide Transparent Updates',
        description: 'Regularly share development progress, roadmap updates, and partnership announcements to maintain investor confidence.',
      },
    ],
  },
  {
    id: 'liquidity-pools',
    title: 'Setting Up Liquidity Pools',
    description: 'Learn how to create liquidity pools for your newly minted meme coin on Raydium DEX.',
    icon: (
      <svg className="w-10 h-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12a8 8 0 01-8 8v0a8 8 0 01-8-8v0a8 8 0 018-8v0a8 8 0 018 8v0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-4-4v8" />
      </svg>
    ),
    steps: [
      {
        title: 'Prepare Your Meme Coin',
        description: 'Make sure your meme coin is created and you have the necessary token amount and SOL for creating the liquidity pool.',
      },
      {
        title: 'Visit Raydium Liquidity',
        description: 'Go to Raydium\'s liquidity pool creation page. You can find a direct link in your "My Tokens" section after token creation.',
      },
      {
        title: 'Select Token Pair',
        description: 'Choose your meme coin and a pairing token (usually SOL or USDC) to create the liquidity pair.',
      },
      {
        title: 'Set Initial Price',
        description: 'Determine the initial price of your meme coin by depositing the appropriate ratio of your token and the paired asset.',
      },
      {
        title: 'Create Pool',
        description: 'Review the details, confirm the transaction in your wallet, and your meme coin will be available for trading.',
      },
    ],
  },
];

export default function GuidesList() {
  return (
    <div className="space-y-12 mb-16">
      <h2 className="text-2xl font-bold text-white mb-8">Step-by-Step Guides</h2>
      
      <div className="space-y-12">
        {guides.map((guide, index) => (
          <motion.div
            key={guide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <GuideCard guide={guide} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}