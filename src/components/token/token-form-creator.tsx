'use client';

import React from 'react';

interface TokenFormCreatorProps {
  formData: {
    creatorName: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TokenFormCreator({ 
  formData, 
  handleInputChange 
}: TokenFormCreatorProps) {
  return (
    <div className="form-section mb-8">
      <div className="form-section-title text-xl text-white mb-4">Creator Information</div>
      
      <div className="bg-[#1e1e1e] rounded-lg p-4">
        <div className="form-field mb-4">
          <label className="field-label block text-gray-300 mb-2">Creator Name</label>
          <input 
            placeholder="Enter creator name" 
            className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
            type="text" 
            name="creatorName"
            value={formData.creatorName}
            onChange={handleInputChange}
          />
          <span className="field-constraint text-xs text-gray-500 mt-1 block">
            This name will appear as the creator in token metadata
          </span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        Customize the creator information instead of using the default SolHype.
      </div>
    </div>
  );
}