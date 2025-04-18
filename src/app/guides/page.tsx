export default function Guides() {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-center mb-10">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Guides & Resources
            </span>
          </h1>
          
          <div className="space-y-12">
            <div className="bg-[#171717] rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-4">How to Create a Solana Token</h2>
              <div className="prose prose-invert max-w-none">
                <ol className="list-decimal pl-5 space-y-4">
                  <li>
                    <strong>Connect Your Wallet</strong>
                    <p className="text-gray-400">
                      Click the "Connect Wallet" button in the top right corner and connect your Phantom, Solflare, or other compatible Solana wallet.
                    </p>
                  </li>
                  <li>
                    <strong>Fill in Token Details</strong>
                    <p className="text-gray-400">
                      Enter your token's name, symbol, supply, and other details. Upload a logo image (1000x1000px recommended).
                    </p>
                  </li>
                  <li>
                    <strong>Configure Token Options</strong>
                    <p className="text-gray-400">
                      Choose whether to include social links and creator information. Select which authorities to revoke (recommended for investor trust).
                    </p>
                  </li>
                  <li>
                    <strong>Launch Your Token</strong>
                    <p className="text-gray-400">
                      Click "Launch Token" and approve the transaction in your wallet. Your token will be created on the Solana blockchain.
                    </p>
                  </li>
                  <li>
                    <strong>Create Liquidity</strong>
                    <p className="text-gray-400">
                      After creating your token, consider setting up a liquidity pool on Raydium or another Solana DEX to make your token tradable.
                    </p>
                  </li>
                </ol>
              </div>
            </div>
            
            <div className="bg-[#171717] rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-4">Token Authorities Explained</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-400">
                  Solana tokens have three types of authorities that control different aspects of the token:
                </p>
                <ul className="list-disc pl-5 space-y-3 mt-4">
                  <li>
                    <strong>Mint Authority</strong>
                    <p className="text-gray-400">
                      Controls the ability to create (mint) new tokens. Revoking this authority creates a fixed supply token that cannot be inflated.
                    </p>
                  </li>
                  <li>
                    <strong>Freeze Authority</strong>
                    <p className="text-gray-400">
                      Controls the ability to freeze token accounts, preventing transfers. Revoking this ensures no one can freeze holders' tokens.
                    </p>
                  </li>
                  <li>
                    <strong>Update Authority</strong>
                    <p className="text-gray-400">
                      Controls the ability to modify token metadata (name, symbol, image, etc.). Revoking makes the token's metadata immutable.
                    </p>
                  </li>
                </ul>
                <p className="text-gray-400 mt-4">
                  For maximum credibility with your community, we recommend revoking all authorities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }