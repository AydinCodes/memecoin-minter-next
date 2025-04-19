'use client';

import React from 'react';

interface SocialLinksFormProps {
  formData: {
    website: string;
    twitter: string;
    telegram: string;
    discord: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SocialLinksForm({ formData, handleInputChange }: SocialLinksFormProps) {
  return (
    <div className="social-links-form bg-[#1e1e1e] rounded-lg p-4 mt-4">
      <h3 className="text-white text-lg mb-4">Social Links</h3>
      
      <div className="space-y-4">
        <div className="form-field">
          <label className="field-label block text-gray-300 mb-2">Website URL</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
            </span>
            <input 
              placeholder="https://your-website.com" 
              className="field-input w-full bg-[#222] border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-white" 
              type="text" 
              name="website"
              value={formData.website}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-field">
          <label className="field-label block text-gray-300 mb-2">Twitter</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
              </svg>
            </span>
            <input 
              placeholder="https://x.com/yourtokenname" 
              className="field-input w-full bg-[#222] border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-white" 
              type="text" 
              name="twitter"
              value={formData.twitter}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-field">
          <label className="field-label block text-gray-300 mb-2">Telegram</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </span>
            <input 
              placeholder="https://t.me/yourtokenname" 
              className="field-input w-full bg-[#222] border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-white" 
              type="text" 
              name="telegram"
              value={formData.telegram}
              onChange={handleInputChange}
            />
          </div>
        </div>
        
        <div className="form-field">
          <label className="field-label block text-gray-300 mb-2">Discord</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </span>
            <input 
              placeholder="https://discord.gg/yourinvite" 
              className="field-input w-full bg-[#222] border border-gray-700 rounded-lg py-3 pl-10 pr-3 text-white" 
              type="text" 
              name="discord"
              value={formData.discord}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Adding social links helps your community find and connect with your project. All fields are optional.
      </div>
    </div>
  );
}