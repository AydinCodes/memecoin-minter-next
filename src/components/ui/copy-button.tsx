'use client';

import { useState } from 'react';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

export default function CopyButton({ textToCopy, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button 
        onClick={handleCopy} 
        className={`copy-button flex items-center justify-center p-2 ${className}`}
        title="Copy to clipboard"
        style={{ width: '30px', height: '30px' }} // Fixed dimensions for better hitbox
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ pointerEvents: 'none' }} // Prevent SVG from intercepting clicks
        >
          {copied ? (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M5 13l4 4L19 7"
              style={{ pointerEvents: 'none' }}
            />
          ) : (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </svg>
      </button>
      <div className={`copy-success ${copied ? 'show' : ''}`}>
        Copied!
      </div>
    </div>
  );
}