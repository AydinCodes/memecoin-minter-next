// src/components/ui/loading.tsx

'use client'

import React, { useState } from 'react'
import { cleanupSessionFiles } from '@/services/pinata-cleanup'

interface LoadingProps {
  message?: string
  steps?: string[]
  /** If provided, controls which step is active; disables auto-advance */
  currentStepIndex?: number
  /** Optional cancel handler */
  onCancel?: () => void
}

export default function Loading({
  message = 'Loading...',
  steps = [],
  currentStepIndex,
  onCancel,
}: LoadingProps) {
  const stepIndex = currentStepIndex != null ? currentStepIndex : 0
  const [isCancelling, setIsCancelling] = useState(false)

  // Handle cancel button click
  const handleCancel = async () => {
    if (isCancelling) return
    setIsCancelling(true)
    
    // Clean up Pinata files
    await cleanupSessionFiles()
    
    // Call the parent's onCancel handler if provided
    if (onCancel) {
      onCancel()
    }
  }

  // Determine if we should show wallet notification based on step
  const showWalletNotification = () => {
    // For client-side flow (revoke update off), wallet appears during step 5 ("Almost done...")
    // For server-side flow (revoke update on), wallet appears during step 3 ("Processing on blockchain...")
    return stepIndex === 3 || stepIndex === 5;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto">
      <div className="relative w-24 h-24 mb-8">
        {/* Outer loading ring */}
        <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-opacity-20"></div>
        
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-blue-500 border-b-indigo-500 border-l-transparent animate-spin"></div>
        
        {/* Inner coin animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-pulse shadow-lg"></div>
        </div>
        
        {/* Token symbol */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-800 font-bold text-xl">
          $
        </div>
      </div>

      <div className="text-white text-xl font-medium mb-6">{message}</div>

      {/* Progress indicator - simplified and more elegant */}
      <div className="w-full mb-8">
        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (stepIndex / (steps.length - 1)) * 100)}%` }}
          ></div>
        </div>
        
        <div className="mt-2 text-gray-400 text-sm text-center">
          {steps[stepIndex]}
          {showWalletNotification() && (
            <div className="text-xs text-yellow-400 mt-1 animate-pulse">
              Please approve the transaction in your wallet
            </div>
          )}
        </div>
      </div>
      
      {/* Cancel button */}
      <button
        onClick={handleCancel}
        disabled={isCancelling}
        className="px-6 py-2 rounded-full bg-transparent border border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400 transition-colors"
      >
        {isCancelling ? 'Cancelling...' : 'Cancel'}
      </button>
    </div>
  )
}