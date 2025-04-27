// src/app/privacy/page.tsx

import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Privacy Policy
          </span>
        </h1>
        
        <div className="bg-[#171717] rounded-xl p-8 shadow-lg mb-8">
          <p className="text-gray-400 mb-6">
            Last Updated: April 23, 2025
          </p>
          
          <div className="space-y-6 text-gray-300">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">1. Introduction</h2>
              <p>
                SolHype ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect information when you use our website and services.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">2. Information We Collect</h2>
              <p>
                When you use SolHype, we may collect the following information:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Wallet address and public blockchain data</li>
                <li>Token creation details, including names, symbols, and metadata</li>
                <li>Images and content uploaded for token creation</li>
                <li>Transaction data related to token creation and management</li>
                <li>Technical information such as browser type, IP address, and device information</li>
                <li>Usage data to understand how you interact with our service</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">3. How We Use Your Information</h2>
              <p>
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>To provide and maintain our services</li>
                <li>To process token creation transactions</li>
                <li>To store and display your created tokens and associated metadata</li>
                <li>To improve and optimize our platform</li>
                <li>To respond to your requests and provide support</li>
                <li>To detect and prevent fraud and unauthorized access</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">4. Blockchain Data</h2>
              <p>
                Please be aware that any information you submit to the Solana blockchain via our service will be publicly available. The nature of blockchain technology means this information cannot be changed or deleted. This includes your wallet address, transaction details, and token metadata.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">5. IPFS Storage</h2>
              <p>
                We use IPFS (InterPlanetary File System) through Pinata to store token metadata and images. Content uploaded to IPFS is distributed across the network and is publicly accessible by anyone with the content identifier (CID). Once uploaded to IPFS, content may remain available even if deleted from our servers.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">6. Cookies and Similar Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">7. Data Sharing and Disclosure</h2>
              <p>
                We do not sell or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>With service providers who help us operate our platform (such as hosting and IPFS pinning services)</li>
                <li>When required by law or to respond to legal process</li>
                <li>To protect our rights, privacy, safety or property</li>
                <li>In connection with a business transaction such as a merger or acquisition</li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">8. Security</h2>
              <p>
                We implement reasonable security measures to protect your information. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">9. Your Rights</h2>
              <p>
                Depending on your location, you may have rights regarding your personal data, such as the right to access, correct, or delete your data. Please note that due to the nature of blockchain technology, we may not be able to delete information that has been recorded on the blockchain.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">10. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">11. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please <Link href="/support" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-400 underline">contact us</Link>.
              </p>

            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/"
            className="bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white text-lg font-medium py-2 px-8 rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}