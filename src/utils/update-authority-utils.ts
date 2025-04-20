// src/utils/update-authority-utils.ts

/**
 * Utility functions for handling update authority operations
 */

/**
 * Validates that the server is properly configured for update authority revocation
 * returns Promise resolving to true if configuration is valid, false otherwise
 */
export async function validateUpdateAuthorityConfig(): Promise<boolean> {
    try {
      const response = await fetch('/api/update-authority', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        console.error("Server configuration check failed:", await response.text());
        return false;
      }
  
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("Error validating update authority configuration:", error);
      return false;
    }
  }
  
  /**
   * Checks the update authority configuration when the form loads or when
   * the user toggles the revokeUpdate option
   * @param enabled Whether revoke update is enabled
   * @param onWarning Callback for showing a warning to the user
   */
  export async function checkUpdateAuthorityStatus(
    enabled: boolean,
    onWarning: (message: string) => void
  ): Promise<void> {
    // Only check if the feature is enabled
    if (enabled) {
      const isValid = await validateUpdateAuthorityConfig();
      
      if (!isValid) {
        onWarning(
          "Warning: The server is not properly configured for revoking update authority. " +
          "This feature might not work correctly. Please contact support."
        );
      } else {
        // Clear any previous warnings if valid
        onWarning("");
      }
    }
  }
  
  /**
   * Gets the update authority public key from the server
   * @returns Promise resolving to the update authority public key
   */
  export async function getUpdateAuthorityPublicKey(): Promise<string | null> {
    try {
      const response = await fetch('/api/update-authority');
      
      if (!response.ok) {
        console.error("Failed to get update authority:", await response.text());
        return null;
      }
      
      const data = await response.json();
      
      if (!data.success || !data.updateAuthorityPublicKey) {
        console.error("Invalid response from update authority endpoint:", data);
        return null;
      }
      
      return data.updateAuthorityPublicKey;
    } catch (error) {
      console.error("Error getting update authority public key:", error);
      return null;
    }
  }