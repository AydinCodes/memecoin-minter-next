'use client';

import React from 'react';

interface SocialLinksProps {
  formData: {
    website: string;
    twitter: string;
    telegram: string;
    discord: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SocialLinksForm({ formData, handleInputChange }: SocialLinksProps) {
  return (
    <div className="social-links-form bg-[#1e1e1e] rounded-lg p-4 mt-4">
      <h3 className="text-white text-lg mb-4">Social Links</h3>
      
      <div className="space-y-4">
        <div className="form-field">
          <label className="field-label block text-gray-300 mb-2">Website URL</label>
          <input 
            placeholder="https://your-website.com" 
            className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
            type="text" 
            name="website"
            value={formData.website}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-field">
          <label className="field-label block text-gray-300 mb-2">Twitter</label>
          <input 
            placeholder="https://x.com/yourtokenname" 
            className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
            type="text" 
            name="twitter"
            value={formData.twitter}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-field">
          <label className="field-label block text-gray-300 mb-2">Telegram</label>
          <input 
            placeholder="https://t.me/yourtokenname" 
            className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
            type="text" 
            name="telegram"
            value={formData.telegram}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-field">
          <label className="field-label block text-gray-300 mb-2">Discord</label>
          <input 
            placeholder="https://discord.gg/yourinvite" 
            className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
            type="text" 
            name="discord"
            value={formData.discord}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
}