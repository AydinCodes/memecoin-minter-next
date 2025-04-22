'use client';

import { motion } from 'framer-motion';
import GuideCard from './guide-card';
// Guide data
const guides = [
  {
    id: 'token-creation',
    title: 'How to Create a Solana Token',
    description: 'A step-by-step guide to create your own token on the Solana blockchain with SolMinter.',
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
        title: 'Fill in Token Details',
        description: 'Enter your token\'s name, symbol, supply, and other details. Upload a logo image (1000x1000px recommended) to give your token a unique identity.',
      },
      {
        title: 'Configure Token Options',
        description: 'Choose whether to include social links and creator information. Select which authorities to revoke (recommended for investor trust).',
      },
      {
        title: 'Launch Your Token',
        description: 'Review your token details, then click "Launch Token" and approve the transaction in your wallet. Your token will be created on the Solana blockchain.',
      },
      {
        title: 'Create Liquidity',
        description: 'After creating your token, set up a liquidity pool on Raydium or another Solana DEX to make your token tradable on the open market.',
      },
    ],
  },
  {
    id: 'token-authorities',
    title: 'Token Authorities Explained',
    description: 'Learn about the different types of authorities in Solana tokens and how they affect your token\'s security and credibility.',
    icon: (
      <svg className="w-10 h-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    content: [
      {
        title: 'Mint Authority',
        description: 'Controls the ability to create (mint) new tokens. Revoking this authority creates a fixed supply token that cannot be inflated, building trust with your community.',
      },
      {
        title: 'Freeze Authority',
        description: 'Controls the ability to freeze token accounts, preventing transfers. Revoking this ensures no one can freeze holders\' tokens, increasing security for token holders.',
      },
      {
        title: 'Update Authority',
        description: 'Controls the ability to modify token metadata (name, symbol, image, etc.). Revoking makes the token\'s metadata immutable, preventing future changes.',
      },
    ],
    recommendation: 'For maximum credibility with your community, we recommend revoking all authorities.',
  },
  {
    id: 'liquidity-pools',
    title: 'Setting Up Liquidity Pools',
    description: 'Learn how to create liquidity pools for your newly minted token on Raydium DEX.',
    icon: (
      <svg className="w-10 h-10 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12a8 8 0 01-8 8v0a8 8 0 01-8-8v0a8 8 0 018-8v0a8 8 0 018 8v0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8m-4-4v8" />
      </svg>
    ),
    steps: [
      {
        title: 'Prepare Your Token',
        description: 'Make sure your token is created and you have the necessary token amount and SOL for creating the liquidity pool.',
      },
      {
        title: 'Visit Raydium Liquidity',
        description: 'Go to Raydium\'s liquidity pool creation page. You can find a direct link in your "My Tokens" section after token creation.',
      },
      {
        title: 'Select Token Pair',
        description: 'Choose your token and a pairing token (usually SOL or USDC) to create the liquidity pair.',
      },
      {
        title: 'Set Initial Price',
        description: 'Determine the initial price of your token by depositing the appropriate ratio of your token and the paired asset.',
      },
      {
        title: 'Create Pool',
        description: 'Review the details, confirm the transaction in your wallet, and your token will be available for trading.',
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