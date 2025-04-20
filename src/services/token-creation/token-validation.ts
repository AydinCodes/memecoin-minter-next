// src/services/token-creation/token-validation.ts
// Functions for validating token parameters

import { FormDataType } from "@/types/token";

/**
 * Validates all token creation parameters before submission
 * @returns Error message or null if valid
 */
export function validateTokenCreationParams(formData: FormDataType): string | null {
  // Validate basic token info
  if (!formData.logo) {
    return "Please upload a logo image";
  }
  
  if (!formData.name || formData.name.trim() === "") {
    return "Token name is required";
  }
  
  if (formData.name.length > 32) {
    return "Token name must be 32 characters or less";
  }
  
  if (!formData.symbol || formData.symbol.trim() === "") {
    return "Token symbol is required";
  }
  
  if (formData.symbol.length > 10) {
    return "Token symbol must be 10 characters or less";
  }
  
  if (!formData.description || formData.description.trim() === "") {
    return "Token description is required";
  }
  
  // Validate token parameters
  if (formData.decimals < 0 || formData.decimals > 9) {
    return "Decimals must be between 0 and 9";
  }
  
  if (formData.supply <= 0) {
    return "Supply must be greater than 0";
  }
  
  if (formData.supply > Number.MAX_SAFE_INTEGER) {
    return "Supply is too large";
  }
  
  // Validate social links if they're enabled
  if (formData.socialLinks) {
    // Optional URL validation
    if (formData.website && !isValidUrl(formData.website)) {
      return "Website URL is invalid";
    }
    
    if (formData.twitter && !isValidUrl(formData.twitter)) {
      return "Twitter URL is invalid";
    }
    
    if (formData.telegram && !isValidUrl(formData.telegram)) {
      return "Telegram URL is invalid";
    }
    
    if (formData.discord && !isValidUrl(formData.discord)) {
      return "Discord URL is invalid";
    }
  }
  
  return null;
}

/**
 * Validates an image file for token logo
 */
export function isValidTokenImage(file: File | null): boolean {
  if (!file) {
    return false;
  }
  
  // Check file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    return false;
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return false;
  }
  
  return true;
}

/**
 * Simple URL validation
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
}