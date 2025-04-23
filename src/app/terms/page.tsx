// src/app/terms/page.tsx

import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Terms of Service
          </span>
        </h1>
        
        <div className="bg-[#171717] rounded-xl p-8 shadow-lg mb-8">
          <p className="text-gray-400 mb-6">
            Last Updated: April 23, 2025
          </p>
          
          <div className="space-y-6 text-gray-300">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">1. Acceptance of Terms</h2>
              <p>
                By accessing or using SolHype's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">2. Description of Service</h2>
              <p>
                SolHype provides a platform for creating and managing tokens on the Solana blockchain. Our services allow users to create, customize, and revoke authorities for Solana tokens, as well as add metadata and social links.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">3. User Responsibilities</h2>
              <p>
                You are responsible for maintaining the security of your wallet and for all activities that occur under your account. You agree not to use the service for any illegal purposes or to create tokens that infringe upon the intellectual property rights of others.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">4. Fees and Payments</h2>
              <p>
                Creating tokens with SolHype requires payment of fees in SOL. Fees vary based on the features selected during token creation. All fees are non-refundable once a transaction has been confirmed on the blockchain.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">5. Blockchain Transactions</h2>
              <p>
                All transactions initiated through SolHype are executed on the Solana blockchain and are irreversible. We cannot reverse, cancel, or refund transactions once they have been confirmed on the blockchain. You acknowledge that blockchain transactions may be subject to network congestion and variable fees.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">6. Token Creation and Management</h2>
              <p>
                SolHype facilitates the creation of tokens on the Solana blockchain. We do not endorse, guarantee, or take responsibility for any tokens created using our service. You are solely responsible for your token's compliance with applicable laws and regulations. Revoking authorities is permanent and cannot be reversed.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">7. Intellectual Property</h2>
              <p>
                You retain all rights to the content you create using SolHype, including token names, symbols, descriptions, and logos. By uploading content to our service, you grant us a non-exclusive, worldwide license to store, display, and use such content solely for the purpose of providing the service.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">8. Limitation of Liability</h2>
              <p>
                SolHype provides its services on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding the reliability, availability, or suitability of our services. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">9. Modifications to the Service</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of our service at any time without prior notice. We may also update these Terms of Service from time to time. Your continued use of the service after such changes constitutes your acceptance of the new terms.
              </p>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">10. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which SolHype operates, without regard to its conflict of law provisions.
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