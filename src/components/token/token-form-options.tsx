'use client';

import React from 'react';
import SocialLinksForm from './social-links-form';

interface TokenFormOptionsProps {
  formData: {
    socialLinks: boolean;
    creatorInfo: boolean;
    website: string;
    twitter: string;
    telegram: string;
    discord: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function TokenFormOptions({
  formData,
  setFormData,
  handleInputChange
}: TokenFormOptionsProps) {
  return (
    <div className="form-section mb-8">
      <div className="toggle-section mb-4">
        <div className="toggle-section-header flex justify-between items-center mb-2">
          <div className="toggle-header-left flex items-center">
            <div className="toggle-wrapper mr-3">
              <input 
                id="creatorInfo" 
                type="checkbox" 
                name="creatorInfo"
                checked={formData.creatorInfo}
                onChange={handleInputChange}
                className="hidden"
              />
              <div 
                className={`toggle w-12 h-6 rounded-full p-1 cursor-pointer ${formData.creatorInfo ? 'bg-purple-600' : 'bg-gray-700'}`}
                onClick={() => setFormData((prev: any) => ({...prev, creatorInfo: !prev.creatorInfo}))}
              >
                <div className={`toggle-marker h-4 w-4 bg-white rounded-full transform transition-transform ${formData.creatorInfo ? 'translate-x-6' : ''}`}></div>
              </div>
            </div>
            <div className="toggle-label text-gray-300">Creator's Info (Optional)</div>
          </div>
          <div className="toggle-cost text-purple-500">+0.1 SOL</div>
        </div>
        <div className="toggle-section-description text-xs text-gray-500">
          Change the information of the creator in the metadata. By default, it is SolMinter.
        </div>
      </div>

      <div className="toggle-section mb-4">
        <div className="toggle-section-header flex justify-between items-center mb-2">
          <div className="toggle-header-left flex items-center">
            <div className="toggle-wrapper mr-3">
              <input 
                id="socialLinks" 
                type="checkbox" 
                name="socialLinks"
                checked={formData.socialLinks}
                onChange={handleInputChange}
                className="hidden"
              />
              <div 
                className={`toggle w-12 h-6 rounded-full p-1 cursor-pointer ${formData.socialLinks ? 'bg-purple-600' : 'bg-gray-700'}`}
                onClick={() => setFormData((prev: any) => ({...prev, socialLinks: !prev.socialLinks}))}
              >
                <div className={`toggle-marker h-4 w-4 bg-white rounded-full transform transition-transform ${formData.socialLinks ? 'translate-x-6' : ''}`}></div>
              </div>
            </div>
            <div className="toggle-label text-gray-300">Add Social Links & Tags</div>
          </div>
          <div className="toggle-cost text-purple-500">+0.1 SOL</div>
        </div>
        <div className="toggle-section-description text-xs text-gray-500">
          Add links to your token metadata.
        </div>
      </div>
      
      {formData.socialLinks && (
        <SocialLinksForm formData={formData} handleInputChange={handleInputChange} />
      )}
    </div>
  );
}