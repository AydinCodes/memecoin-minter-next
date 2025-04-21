'use client';

import Link from 'next/link';

interface TokenErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function TokenErrorState({ message, onRetry }: TokenErrorStateProps) {
  return (
    <div className="bg-[#171717] rounded-xl p-8 shadow-lg border border-red-800 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h2>
        <p className="text-gray-400 mb-6">
          {message || "We couldn't load your token information. Please try again later."}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="bg-red-700 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-full transition-colors"
            >
              Try Again
            </button>
          )}
          
          <Link 
            href="/create-token"
            className="bg-purple-700 hover:bg-purple-600 text-white font-medium py-2 px-6 rounded-full transition-colors"
          >
            Create New Token
          </Link>
          
          <Link 
            href="/"
            className="bg-transparent border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white font-medium py-2 px-6 rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}