// src/components/ui/loading.tsx

"use client";

import React, { useState, useEffect } from "react";
import { cleanupSessionFiles } from "@/services/pinata-cleanup";
import "@/styles/loading.css";

interface LoadingProps {
  message?: string;
  steps?: string[];
  /** If provided, controls which step is active; disables auto-advance */
  currentStepIndex?: number;
  /** Optional cancel handler */
  onCancel?: () => void;
}

export default function Loading({
  message = "Loading...",
  steps = [],
  currentStepIndex,
  onCancel,
}: LoadingProps) {
  const stepIndex = currentStepIndex != null ? currentStepIndex : 0;
  const [isCancelling, setIsCancelling] = useState(false);

  // Force scroll to top when the component mounts and whenever the step changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0; // For Safari
  }, []);
  
  // Separate effect for step changes to avoid flashing
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0; // For Safari
  }, [currentStepIndex]);

  // Handle cancel button click
  const handleCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);

    console.log("Cancellation initiated by user. Cleaning up resources...");
    
    // Clean up Pinata files
    await cleanupSessionFiles();

    // Call the parent's onCancel handler if provided
    if (onCancel) {
      onCancel();
    }
  };

  // Determine if we should show wallet notification based on step
  const showWalletNotification = () => {
    // For client-side flow (revoke update off), wallet appears during step 5 ("Almost done...")
    // For server-side flow (revoke update on), wallet appears during step 3 ("Processing on blockchain...")
    return stepIndex === 3 || stepIndex === 5;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 max-w-md mx-auto">
      <div className="relative mb-8">
        {/* New wave loader */}
        <div className="wave-loader"></div>
      </div>

      <div className="w-full mb-8">
        <div className="mt-2 text-gray-400 text-sm text-center">
          {steps[stepIndex]}
          {showWalletNotification() && (
            <div className="text-xs text-yellow-400 mt-1 wallet-notification">
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
        {isCancelling ? "Cancelling..." : "Cancel"}
      </button>
    </div>
  );
}