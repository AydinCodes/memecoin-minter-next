'use client';

import React from 'react';

interface TokenFormAuthoritiesProps {
  formData: {
    revokeMint: boolean;
    revokeFreeze: boolean;
    revokeUpdate: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function TokenFormAuthorities({
  formData,
  setFormData
}: TokenFormAuthoritiesProps) {
  // Handle checkbox click with proper event simulation
  const handleCheckboxClick = (field: 'revokeMint' | 'revokeFreeze' | 'revokeUpdate') => {
    // Update the formData state
    setFormData((prev: any) => ({
      ...prev,
      [field]: !prev[field]
    }));
    
    // Find the related hidden checkbox and simulate a change event
    const checkbox = document.getElementById(field) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !formData[field];
      // Create a proper change event that includes name and checked properties
      const event = new Event('change', { bubbles: true });
      
      // Add properties to the event object using Object.defineProperty
      Object.defineProperty(event, 'target', {
        writable: false,
        value: {
          name: field,
          type: 'checkbox',
          checked: !formData[field]
        }
      });
      
      checkbox.dispatchEvent(event);
    }
  };

  return (
    <div className="form-section mb-8">
      <div className="form-section-title text-xl text-white mb-4">Revoke Authorities (Investor's Booster)</div>
      
      <div className="form-section-authorities space-y-4">
        <div className="form-checkbox-field">
          <div className="form-checkbox-header flex justify-between items-center mb-1">
            <div className="flex items-center">
              <div className="form-checkbox-label text-gray-300 mr-3">Revoke Freeze</div>
              <input 
                id="revokeFreeze" 
                type="checkbox" 
                name="revokeFreeze"
                checked={formData.revokeFreeze}
                onChange={(e) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    revokeFreeze: e.target.checked
                  }));
                }}
                className="hidden" // Keep hidden but track state
              />
              <div 
                className={`checkbox w-5 h-5 border ${formData.revokeFreeze ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600'} rounded flex items-center justify-center cursor-pointer`}
                onClick={() => handleCheckboxClick('revokeFreeze')}
              >
                {formData.revokeFreeze && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className="form-checkbox-description text-xs text-gray-500">
            No one will be able to freeze holders' token accounts anymore
          </div>
          <div className="form-checkbox-cost text-xs text-purple-500 mt-1">+0.1 SOL</div>
        </div>

        <div className="form-checkbox-field">
          <div className="form-checkbox-header flex justify-between items-center mb-1">
            <div className="flex items-center">
              <div className="form-checkbox-label text-gray-300 mr-3">Revoke Mint</div>
              <input 
                id="revokeMint" 
                type="checkbox" 
                name="revokeMint"
                checked={formData.revokeMint}
                onChange={(e) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    revokeMint: e.target.checked
                  }));
                }}
                className="hidden" // Keep hidden but track state
              />
              <div 
                className={`checkbox w-5 h-5 border ${formData.revokeMint ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600'} rounded flex items-center justify-center cursor-pointer`}
                onClick={() => handleCheckboxClick('revokeMint')}
              >
                {formData.revokeMint && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className="form-checkbox-description text-xs text-gray-500">
            No one will be able to create more tokens anymore
          </div>
          <div className="form-checkbox-cost text-xs text-purple-500 mt-1">+0.1 SOL</div>
        </div>

        <div className="form-checkbox-field">
          <div className="form-checkbox-header flex justify-between items-center mb-1">
            <div className="flex items-center">
              <div className="form-checkbox-label text-gray-300 mr-3">Revoke Update</div>
              <input 
                id="revokeUpdate" 
                type="checkbox" 
                name="revokeUpdate"
                checked={formData.revokeUpdate}
                onChange={(e) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    revokeUpdate: e.target.checked
                  }));
                }}
                className="hidden" // Keep hidden but track state
              />
              <div 
                className={`checkbox w-5 h-5 border ${formData.revokeUpdate ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600'} rounded flex items-center justify-center cursor-pointer`}
                onClick={() => handleCheckboxClick('revokeUpdate')}
              >
                {formData.revokeUpdate && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className="form-checkbox-description text-xs text-gray-500">
            No one will be able to modify token metadata anymore
          </div>
          <div className="form-checkbox-cost text-xs text-purple-500 mt-1">+0.1 SOL</div>
        </div>
      </div>
      
      <div className="form-section-description text-xs text-gray-500 mt-4">
        Solana Token has 3 authorities: Freeze Authority, Mint Authority, and Update Authority. Revoke them to attract more investors.
      </div>
    </div>
  );
}