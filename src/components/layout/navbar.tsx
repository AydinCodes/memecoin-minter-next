// src/components/layout/navbar.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import WalletButton from "../wallet/wallet-button";
import AnimatedLogo from "../ui/animated-logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isCreateTokenPage = pathname === "/create-token";

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
    // Only force refresh if we're already on the create-token page
    if (isCreateTokenPage) {
      e.preventDefault();
      window.location.href = "/create-token";
    }
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
              <AnimatedLogo />
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
                onClick={handleCreateTokenClick}
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
    </div>
  );
}
