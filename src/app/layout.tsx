import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileBlocker from "@/components/ui/mobile-blocker";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolHype - Create Viral Solana Meme Coins & Tokens Easily",
  description:
    "Create, launch, and manage Solana meme coins in seconds. The simplest no-code platform for Solana token creation. Launch viral meme coins today.",
};

// Separate viewport export as recommended by Next.js
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0, 
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded"
          rel="stylesheet"
        />
        {/* Add extra meta tags for mobile */}
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Add inline script to immediately prevent scrolling on mobile */}
        <Script id="prevent-mobile-scroll" strategy="beforeInteractive">
          {`
            (function() {
              if (window.innerWidth < 768) {
                document.documentElement.style.overflow = 'hidden';
                document.documentElement.style.height = '100%';
                document.body.style.overflow = 'hidden';
                document.body.style.height = '100%';
                document.body.style.position = 'fixed';
                document.body.style.touchAction = 'none';
                document.body.style.width = '100%';
              }
            })();
          `}
        </Script>
        
        {/* Inline style for immediate effect during page load */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 767px) {
            html, body {
              overflow: hidden !important;
              position: fixed !important;
              width: 100% !important;
              height: 100% !important;
              height: -webkit-fill-available !important;
              touch-action: none !important;
              -webkit-overflow-scrolling: none !important;
              overscroll-behavior: none !important;
            }
          }
        `}} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white`}
        style={{ height: '100%', overscrollBehavior: 'none' }}
      >
        <Providers>
          {/* Desktop view */}
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {/* Add padding-top to main content to account for the fixed navbar */}
            <main className="flex-grow pt-24">{children}</main>
            <Footer />
          </div>
          
          {/* Mobile/tablet blocker overlay */}
          <MobileBlocker />
        </Providers>
      </body>
    </html>
  );
}