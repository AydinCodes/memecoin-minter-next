'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <div className="footer-container bg-[#111] border-t border-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link href="/" className="logo-container mb-4 md:mb-0">
            <div className="logo-img">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">SolMinter</span>
            </div>
          </Link>
          
          <div className="bottom-bar flex flex-col md:flex-row items-center">
            <div className="copyright-bar text-gray-500 text-sm mb-2 md:mb-0">
              <span>© SolMinter 2025</span>
            </div>
            
            <div className="policies-bar flex ml-0 md:ml-6">
              <Link href="/terms" className="policy-link text-gray-500 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <span className="separator mx-2 text-gray-600">|</span>
              <Link href="/privacy" className="policy-link text-gray-500 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}