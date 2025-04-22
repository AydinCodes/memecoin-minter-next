// src/services/pinata-cleanup.ts

/**
 * Utility functions for cleaning up Pinata IPFS files
 * Used when a token creation transaction is canceled
 */

let currentSessionUuid: string | null = null;

/**
 * Gets the current session UUID
 * This UUID is used to track files uploaded during a token creation attempt
 */
export function getCurrentSessionUuid(): string | null {
  return currentSessionUuid;
}

/**
 * Sets the current session UUID from the IPFS service
 * Should be called when the IPFS service generates a new UUID
 */
export function setCurrentSessionUuid(uuid: string | null): void {
  currentSessionUuid = uuid;
  console.log(`Session UUID ${uuid ? `set to: ${uuid}` : 'cleared'}`);
}

/**
 * Deletes all Pinata files associated with the current session UUID
 * Called when a token creation transaction fails or is canceled
 * This function is exported for use by the Cancel button in the Loading component
 */
export async function cleanupSessionFiles(): Promise<boolean> {
  if (!currentSessionUuid) {
    console.log('No session UUID to cleanup');
    return false;
  }
  
  try {
    console.log(`Cleaning up Pinata files for session: ${currentSessionUuid}`);
    
    const response = await fetch('/api/delete-pinata-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uuid: currentSessionUuid
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to cleanup Pinata files:', await response.text());
      return false;
    }
    
    const result = await response.json();
    console.log('Pinata cleanup result:', result);
    
    // Clear the session UUID after successful cleanup
    currentSessionUuid = null;
    
    return true;
  } catch (error) {
    console.error('Error cleaning up Pinata files:', error);
    return false;
  }
}

/**
 * Handles error by cleaning up any uploaded files if the error matches known patterns
 * for user cancellation or transaction failure
 * 
 * @param error The error object or string
 * @returns The original error for further handling
 */
export async function handleErrorWithCleanup(error: unknown): Promise<unknown> {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Check if the error is a user cancellation or transaction failure
  if (
    errorMessage.includes('Transaction was canceled by the user') ||
    errorMessage.includes('User rejected') ||
    errorMessage.includes('Wallet adapter error') ||
    errorMessage.includes('Failed to process transaction')
  ) {
    console.log('Transaction was canceled. Cleaning up Pinata files...');
    await cleanupSessionFiles();
  }
  
  // Return the original error for further handling
  return error;
}