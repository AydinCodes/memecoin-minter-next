import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
          Sol Meme Coin Minter
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Create your own Solana meme coins with ease.
        </p>
        <div className="mt-10">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connect your wallet to get started
          </p>
        </div>
      </div>
    </div>
  );
}