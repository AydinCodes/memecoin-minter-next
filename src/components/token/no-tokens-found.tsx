'use client';

import Link from 'next/link';

export default function NoTokensFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="max-w-3xl w-full mx-auto p-10 bg-[#171717] rounded-xl text-center">
        <div className="w-20 h-20 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">No Tokens Found</h2>
        <p className="text-gray-400 mb-8">
          You haven't created any tokens with SolMinter yet. Get started by creating your first token!
        </p>
        
        <Link 
          href="/create-token" 
          className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 px-8 rounded-full hover:shadow-lg transition-all"
        >
          Create Your First Token
        </Link>
      </div>
    </div>
  );
}