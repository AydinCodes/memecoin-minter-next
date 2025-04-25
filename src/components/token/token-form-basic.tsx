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
    largeImageSize: boolean;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formSubmitted?: boolean; // Prop to track if form was submitted
  imageSizeError?: string | null; // New prop for image size errors
  sizeLimit?: number; // Size limit in bytes
}

export default function TokenFormBasic({
  formData,
  handleInputChange,
  handleFileChange,
  formSubmitted = false,
  imageSizeError = null,
  sizeLimit = 500 * 1024 // Default 500KB
}: TokenFormBasicProps) {
  // Create a ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      // Reset the value before clicking to ensure the change event fires
      // even if selecting the same file after toggling large image size
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Current size limit display
  const sizeLimitDisplay = formatFileSize(sizeLimit);

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
            className={`img-input-wrapper border-2 border-dashed ${imageSizeError ? 'border-red-500' : 'border-gray-700'} rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors`}
            onClick={triggerFileInput}
          >
            <span className="material-symbols-rounded text-3xl mb-2 text-gray-400 block">upload</span>
            <span className="text-1 block text-gray-300 mb-1">Drag and drop here to upload</span>
            <div className="text-2 text-xs text-gray-500">.png, .jpg (Max: {sizeLimitDisplay})</div>
            <input 
              ref={fileInputRef}
              accept=".png, .jpg, .jpeg" 
              className="form-img hidden" 
              type="file"
              onChange={handleFileChange}
            />
          </div>
          <div className="mt-1">
            {imageSizeError ? (
              <span className="text-red-400 text-xs block">{imageSizeError}</span>
            ) : (
              <span className="field-constraint text-xs text-gray-500 block">
                Add logo for your token (Max size: {sizeLimitDisplay})
              </span>
            )}
            
            {formSubmitted && !formData.logo && !imageSizeError && (
              <span className="text-red-400 text-xs block mt-1">
                Logo image is required
              </span>
            )}
          </div>
        </div>
        
        <div className="logo-preview flex items-center justify-center">
          {formData.logo ? (
            <div className="flex flex-col items-center">
              <img 
                src={URL.createObjectURL(formData.logo)} 
                alt="Token Logo Preview" 
                className="max-h-40 rounded-lg border border-gray-700"
              />
              <div className="mt-2 flex flex-col items-center">
                <span className="text-xs text-gray-400">
                  Size: {formatFileSize(formData.logo.size)}
                </span>
                {formData.largeImageSize && formData.logo.size <= 500 * 1024 && (
                  <span className="text-xs text-amber-400 mt-1">
                    Note: This image would fit within the standard size limit. Large image upgrade not needed.
                  </span>
                )}
              </div>
            </div>
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