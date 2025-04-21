"use client";

import Link from "next/link";
import WalletButton from "../wallet/wallet-button";

export default function Navbar() {
  return (
    <div className="nav-container bg-[#111] border-b border-gray-800 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="logo-container flex items-center">
            <div className="logo-img">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                SolMinter
              </span>
            </div>
          </Link>

          <nav className="main-nav hidden md:flex space-x-6">
            <Link
              href="/"
              className="nav-link text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/create-token"
              className="nav-link text-gray-300 hover:text-white transition-colors"
            >
              Create Token
            </Link>
            <Link
              href="/my-tokens"
              className="nav-link text-gray-300 hover:text-white transition-colors"
            >
              My Tokens
            </Link>
            <a
              href="https://raydium.io/liquidity/create-pool"
              className="nav-link text-gray-300 hover:text-white transition-colors"
              rel="noopener noreferrer"
              target="_blank"
            >
              Liquidity Pool
            </a>
            <a
              href="https://raydium.io/swap"
              className="nav-link text-gray-300 hover:text-white transition-colors"
              rel="noopener noreferrer"
              target="_blank"
            >
              Manage Liquidity
            </a>
            <Link
              href="/guides"
              className="nav-link text-gray-300 hover:text-white transition-colors"
            >
              Guides
            </Link>
          </nav>

          <div className="wallet-dropdown">
            <WalletButton />
          </div>
        </div>
      </div>
    </div>
  );
}
