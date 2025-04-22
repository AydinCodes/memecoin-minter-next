"use client";
import { motion } from "framer-motion";

const features = [
  {
    title: "Easy Token Creation",
    description: "Mint your token in just a few clicks—no coding required.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10 text-purple-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Secure & Trusted",
    description:
      "Built on Solana blockchain with industry-standard security protocols.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    title: "Ultra-Fast Deployment",
    description:
      "Launch your token in seconds with Solana's high-performance network.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-10 h-10 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-12">
          Why Choose SolMinter?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="bg-[#171717] p-8 rounded-2xl shadow-lg flex flex-col items-center"
            >
              <div className="mb-6 flex justify-center bg-opacity-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 rounded-full">
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {f.title}
              </h3>
              <p className="text-gray-400">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
