"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import WalletButton from "../wallet/wallet-button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position to add shadow and background when scrolled
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // Function to handle direct navigation to create-token
  const handleCreateTokenClick = (e: React.MouseEvent) => {
    // Force a full page navigation to reset state
    window.location.href = "/create-token";
  };

  return (
    <div
      className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "top-2" : "top-4"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div
          className={`nav-container rounded-full py-3 px-6 transition-all duration-300 ${
            scrolled
              ? "bg-black/50 backdrop-blur-md shadow-lg shadow-black/20"
              : "bg-transparent"
          }`}
        >
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
              <a
                href="/create-token"
                className="nav-link text-gray-300 hover:text-white transition-colors"
                onClick={handleCreateTokenClick}
              >
                Create Token
              </a>
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
    </div>
  );
}
