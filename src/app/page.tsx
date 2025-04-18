import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              SolMinter
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Create, launch, and manage Solana tokens with ease. 
            Your one-stop solution for Solana meme coin creation.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="/create-token" className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 px-8 rounded-full hover:shadow-lg transition-all">
              Create Token
            </Link>
            <Link href="/guides" className="bg-transparent border border-purple-500 text-purple-500 font-medium py-3 px-8 rounded-full hover:bg-purple-500 hover:text-white hover:shadow-lg transition-all">
              Learn More
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card bg-[#171717] p-6 rounded-xl shadow-lg">
              <div className="icon-circle w-16 h-16 bg-purple-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Easy Token Creation</h2>
              <p className="text-gray-400">Create your Solana token with just a few clicks. No coding required.</p>
            </div>
            
            <div className="feature-card bg-[#171717] p-6 rounded-xl shadow-lg">
              <div className="icon-circle w-16 h-16 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Secure & Trusted</h2>
              <p className="text-gray-400">Built on Solana for fast transactions and high security standards.</p>
            </div>
            
            <div className="feature-card bg-[#171717] p-6 rounded-xl shadow-lg">
              <div className="icon-circle w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Lightning Fast</h2>
              <p className="text-gray-400">Launch your token in seconds with minimal fees on the Solana blockchain.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};  