'use client';

import React, { useRef } from 'react';

interface TokenFormBasicProps {
  formData: {
    name: string;
    symbol: string;
    decimals: number;
    supply: number;
    description: string;
    logo: File | null;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TokenFormBasic({
  formData,
  handleInputChange,
  handleFileChange
}: TokenFormBasicProps) {
  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="form-section mb-8">
      <div className="form-field mb-4">
        <label className="field-label block text-gray-300 mb-2">Token Name *</label>
        <input 
          placeholder="Ex: Moon Coin" 
          className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <span className="field-constraint text-xs text-gray-500 mt-1 block">Max 32 characters in your name</span>
      </div>

      <div className="form-field mb-4">
        <label className="field-label block text-gray-300 mb-2">Token Symbol *</label>
        <input 
          placeholder="Ex: MOON" 
          className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
          type="text" 
          name="symbol"
          value={formData.symbol}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-field mb-4">
        <label className="field-label block text-gray-300 mb-2">Decimals *</label>
        <input 
          placeholder="Ex: 9" 
          className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
          type="number" 
          name="decimals"
          value={formData.decimals}
          onChange={handleInputChange}
          min="0"
          max="18"
          required
        />
        <span className="field-constraint text-xs text-gray-500 mt-1 block">Change the number of decimals for your token</span>
      </div>

      <div className="form-field mb-4">
        <label className="field-label block text-gray-300 mb-2">Supply *</label>
        <input 
          placeholder="Ex: 1000000000" 
          className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white" 
          type="number" 
          name="supply"
          value={formData.supply}
          onChange={handleInputChange}
          required
        />
        <span className="field-constraint text-xs text-gray-500 mt-1 block">The initial number of available tokens that will be created in your wallet</span>
      </div>

      <div className="logo-wrapper grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="logo-box">
          <span className="label-text block text-gray-300 mb-2">Logo *</span>
          <div 
            className="img-input-wrapper border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors" 
            onClick={triggerFileInput}
          >
            <span className="material-symbols-rounded text-3xl mb-2 text-gray-400 block">upload</span>
            <span className="text-1 block text-gray-300 mb-1">Drag and drop here to upload</span>
            <div className="text-2 text-xs text-gray-500">.png, .jpg 1000x1000 px</div>
            <input 
              ref={fileInputRef}
              accept=".png, .jpg, .jpeg" 
              className="form-img hidden" 
              type="file"
              onChange={handleFileChange}
              // Remove required from hidden input
            />
          </div>
          <span className="field-constraint text-xs text-gray-500 mt-1 block">Add logo for your token</span>
          {!formData.logo && (
            <span className="text-red-400 text-xs mt-1 block">
              Logo image is required
            </span>
          )}
        </div>
        
        <div className="logo-preview flex items-center justify-center">
          {formData.logo ? (
            <img 
              src={URL.createObjectURL(formData.logo)} 
              alt="Token Logo Preview" 
              className="max-h-40 rounded-lg border border-gray-700"
            />
          ) : (
            <div className="text-gray-500 text-sm">Logo preview will appear here</div>
          )}
        </div>
      </div>

      <div className="form-field mb-4">
        <label className="field-label block text-gray-300 mb-2">Description *</label>
        <textarea 
          placeholder="Here you can describe your token" 
          className="field-input w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white h-24" 
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />
      </div>
    </div>
  );
}