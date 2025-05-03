// src/components/token/token-form-authorities.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { checkUpdateAuthorityStatus } from '@/utils/update-authority-utils';

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
  const [updateAuthorityWarning, setUpdateAuthorityWarning] = useState<string>("");
  const [isCheckingConfig, setIsCheckingConfig] = useState<boolean>(false);

  // Check update authority configuration on initial load and when toggled
  useEffect(() => {
    async function checkConfig() {
      if (formData.revokeUpdate) {
        setIsCheckingConfig(true);
        await checkUpdateAuthorityStatus(
          formData.revokeUpdate, 
          (message) => setUpdateAuthorityWarning(message)
        );
        setIsCheckingConfig(false);
      } else {
        setUpdateAuthorityWarning("");
      }
    }
    
    checkConfig();
  }, [formData.revokeUpdate]);

  // Handle checkbox click with proper event simulation
  const handleCheckboxClick = (field: 'revokeMint' | 'revokeFreeze' | 'revokeUpdate') => {
    // Check if this would disable all checkboxes
    const wouldDisableAll = 
      (field === 'revokeMint' && formData.revokeMint && !formData.revokeFreeze && !formData.revokeUpdate) ||
      (field === 'revokeFreeze' && !formData.revokeMint && formData.revokeFreeze && !formData.revokeUpdate) ||
      (field === 'revokeUpdate' && !formData.revokeMint && !formData.revokeFreeze && formData.revokeUpdate);

    // If this would disable all checkboxes, don't allow it
    if (wouldDisableAll) {
      console.log("Cannot disable all authorities - at least one must be enabled");
      return;
    }
    
    // Update the formData state
    setFormData((prev: any) => ({
      ...prev,
      [field]: !prev[field]
    }));
    
    // Find the related hidden checkbox and simulate a change event
    const checkbox = document.getElementById(field) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !formData[field];
      // Create a proper change event
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
                  // Only allow change if it won't disable all checkboxes
                  if (e.target.checked || formData.revokeMint || formData.revokeUpdate) {
                    setFormData((prev: any) => ({
                      ...prev,
                      revokeFreeze: e.target.checked
                    }));
                  }
                }}
                className="hidden" // Keep hidden but track state
              />
              <div 
                className={`checkbox w-5 h-5 border ml-3 ${formData.revokeFreeze ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600'} rounded flex items-center justify-center cursor-pointer`}
                onClick={() => handleCheckboxClick('revokeFreeze')}
              >
                {formData.revokeFreeze && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </div>
            <div className="form-checkbox-cost flex items-center">
              <span className="text-purple-500">FREE</span>
            </div>
          </div>
          <div className="form-checkbox-description text-xs text-gray-500">
            No one will be able to freeze holders' token accounts anymore
          </div>
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
                  // Only allow change if it won't disable all checkboxes
                  if (e.target.checked || formData.revokeFreeze || formData.revokeUpdate) {
                    setFormData((prev: any) => ({
                      ...prev,
                      revokeMint: e.target.checked
                    }));
                  }
                }}
                className="hidden" // Keep hidden but track state
              />
              <div 
                className={`checkbox w-5 h-5 border ml-3 ${formData.revokeMint ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600'} rounded flex items-center justify-center cursor-pointer`}
                onClick={() => handleCheckboxClick('revokeMint')}
              >
                {formData.revokeMint && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </div>
            <div className="form-checkbox-cost flex items-center">
              <span className="text-purple-500">FREE</span>
            </div>
          </div>
          <div className="form-checkbox-description text-xs text-gray-500">
            No one will be able to create more tokens anymore
          </div>
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
                  // Only allow change if it won't disable all checkboxes
                  if (e.target.checked || formData.revokeMint || formData.revokeFreeze) {
                    setFormData((prev: any) => ({
                      ...prev,
                      revokeUpdate: e.target.checked
                    }));
                  }
                }}
                className="hidden" // Keep hidden but track state
              />
              <div 
                className={`checkbox w-5 h-5 border ml-3 ${formData.revokeUpdate ? 'bg-purple-600 border-purple-600' : 'bg-transparent border-gray-600'} rounded flex items-center justify-center cursor-pointer`}
                onClick={() => handleCheckboxClick('revokeUpdate')}
              >
                {formData.revokeUpdate && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </div>
            <div className="form-checkbox-cost flex items-center">
              <span className="text-purple-500">FREE</span>
            </div>
          </div>
          <div className="form-checkbox-description text-xs text-gray-500">
            No one will be able to modify token metadata anymore
          </div>
          
          {/* Display warning if there's an issue with update authority configuration */}
          {updateAuthorityWarning && (
            <div className="mt-2 text-xs text-amber-500 bg-amber-950/40 p-2 rounded">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                {updateAuthorityWarning}
              </div>
            </div>
          )}
          
          {/* Show loading spinner when checking server configuration */}
          {isCheckingConfig && (
            <div className="mt-2 text-xs text-blue-500 flex items-center">
              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking server configuration...
            </div>
          )}
        </div>
      </div>
      
      <div className="form-section-description text-xs text-gray-500 mt-4">
        Solana Token has 3 authorities: Freeze Authority, Mint Authority, and Update Authority. Revoke them to attract more investors.
      </div>
    </div>
  );
}