'use client';

import React from 'react';
import SocialLinksForm from './social-links-form';
import { FEE_CONSTANTS } from '@/services/fee-service';
import { TOTAL_FEE } from '@/config';

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
  // Toggle function that also updates the input checkbox
  const toggleOption = (option: 'socialLinks' | 'creatorInfo') => {
    // Update the formData state
    setFormData((prev: any) => ({
      ...prev, 
      [option]: !prev[option]
    }));
    
    // Also simulate changing the checkbox by dispatching an event
    const checkbox = document.getElementById(option) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !formData[option];
      const event = new Event('change', { bubbles: true });
      checkbox.dispatchEvent(event);
    }
  };

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
                onClick={() => toggleOption('creatorInfo')}
              >
                <div className={`toggle-marker h-4 w-4 bg-white rounded-full transform transition-transform ${formData.creatorInfo ? 'translate-x-6' : ''}`}></div>
              </div>
            </div>
            <div className="toggle-label text-gray-300 mr-3">Creator's Info</div>
          </div>
          <div className="toggle-cost flex items-center">
            <span className="text-purple-500">FREE</span>
          </div>
        </div>
        <div className="toggle-section-description text-xs text-gray-500">
          Change the information of the creator in the metadata. By default, it is SolHype.
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
                onClick={() => toggleOption('socialLinks')}
              >
                <div className={`toggle-marker h-4 w-4 bg-white rounded-full transform transition-transform ${formData.socialLinks ? 'translate-x-6' : ''}`}></div>
              </div>
            </div>
            <div className="toggle-label text-gray-300 mr-3">Add Social Links & Tags</div>
          </div>
          <div className="toggle-cost flex items-center">
            <span className="text-purple-500">FREE</span>
          </div>
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