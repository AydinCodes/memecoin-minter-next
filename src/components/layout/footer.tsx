// src/components/layout/footer.tsx

'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <div className="footer-container bg-[#111] border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link href="/" className="logo-container mb-6 md:mb-0">
            <div className="logo-img">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">SolHype</span>
            </div>
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0">
            <div className="links-container flex space-x-6 mb-4 md:mb-0 md:mr-8">
              <Link 
                href="/guides" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Guides
              </Link>
              <Link 
                href="/my-tokens" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                My Tokens
              </Link>
              <Link 
                href="/support" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Support
              </Link>
              <a 
                href="https://raydium.io/swap" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Raydium
              </a>
            </div>
            
            <div className="legal-container flex items-center">
              <span className="text-gray-500 text-sm mr-4">© SolHype {year}</span>
              <div className="flex items-center">
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms
                </Link>
                <span className="text-gray-600 mx-2">|</span>
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}