'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "What is SolHype?",
    answer: "SolHype is a user-friendly platform that allows anyone to create and launch Solana tokens and meme coins without any coding knowledge. Our intuitive interface guides you through the entire process, from customizing token parameters to revoking authorities for enhanced security."
  },
  {
    question: "How can I create a token on the Solana blockchain?",
    answer: "Creating a token is simple! Just connect your Solana wallet, fill in your token details (name, symbol, supply, etc.), upload a logo, configure your desired settings like authority revocation, and click 'Launch Token'. After confirming the transaction in your wallet, your token will be created on the Solana blockchain in seconds."
  },
  {
    question: "How can I manage token authorities on Solana?",
    answer: "Solana tokens have three authorities: Mint (controls token supply), Freeze (can freeze token transfers), and Update (modifies token metadata). SolHype lets you revoke any of these authorities to enhance investor trust. Once revoked, these authorities cannot be restored, making your token more secure and trustworthy."
  },
  {
    question: "How do I create a successful meme coin on Solana?",
    answer: "Creating a successful meme coin starts with a unique concept and strong branding. With SolHype, you can easily launch your meme coin by connecting your wallet, uploading your unique logo, setting your token parameters, and revoking authorities to build investor trust. After launch, focus on building community through social channels and creating liquidity pools to enable trading."
  },
  {
    question: "What support resources are available if I encounter issues during my token launch?",
    answer: "We offer comprehensive guides and resources to help you through the token creation process. You can find step-by-step tutorials in our Guides section. If you encounter any technical issues, our support team is available to assist you."
  },
  {
    question: "Do I need any programming skills to launch a token on your platform?",
    answer: "No programming skills required! SolHype is designed to be accessible for everyone, including non-technical users. Our intuitive interface handles all the complex blockchain interactions behind the scenes, allowing you to focus on your token's branding and features."
  },
  {
    question: "How can I confirm that my token launch was successful?",
    answer: "After your token is created, you'll be redirected to a success page showing your token's details, including the token address. You can view your created tokens in the 'My Tokens' section, where you'll find links to the Solana Explorer to verify your token on-chain. You can also create liquidity pools and start trading right away."
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 bottom-20 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Find quick answers to all common questions about creating meme coins and tokens on SolHype
          </p>
        </motion.div>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-[#171717] rounded-xl border ${openIndex === index ? 'border-purple-500/30' : 'border-gray-800'} hover:border-purple-500/30 transition-all`}
            >
              <button
                onClick={() => toggleItem(index)}
                className="flex justify-between items-center w-full px-6 py-5 text-left"
              >
                <h3 className="text-xl font-semibold text-white">{item.question}</h3>
                <div className={`text-purple-500 transform transition-transform duration-300 ${openIndex === index ? 'rotate-45' : 'rotate-0'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                </div>
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index 
                    ? 'max-h-96 opacity-100 pb-5' 
                    : 'max-h-0 opacity-0 pb-0'
                }`}
              >
                <div className="text-gray-400">
                  {item.answer}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}