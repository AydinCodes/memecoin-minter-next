// src/components/token/token-form.tsx

"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { useRouter, usePathname } from "next/navigation"
import {
  createTokenWithMetadata,
} from "@/services/token-service"
import { calculateFee, formatFee } from "@/services/fee-service"
import TokenCreationSuccess from "./token-creation-success"
import Loading from "../ui/loading"
import TokenFormBasic from "./token-form-basic"
import TokenFormOptions from "./token-form-options"
import TokenFormAuthorities from "./token-form-authorities"
import TokenFormCreator from "./token-form-creator"
import WalletRequired from "../wallet/wallet-required"
import { FormDataType, TokenResult } from "@/types/token"
import { SOLANA_NETWORK_FEE } from "@/config"
import { resetSessionUuid } from "@/services/ipfs-service"

// Enhanced steps with more concise and user-friendly messages
const STEPS = [
  "Uploading token image...",
  "Creating token metadata...",
  "Preparing transaction...",
  "Processing on blockchain...",
  "Finalizing token details...",
  "Almost done...",
  "Completing token creation...",
]

const DEFAULT_FORM_DATA: FormDataType = {
  name: "",
  symbol: "",
  decimals: 9,
  supply: 1_000_000_000,
  description: "",
  logo: null,
  revokeMint: true,
  revokeFreeze: true,
  revokeUpdate: true,
  socialLinks: false,
  creatorInfo: false,
  creatorName: "SolHype", // Default creator name
  website: "",
  twitter: "",
  telegram: "",
  discord: "",
};

export default function TokenForm() {
  const walletAdapter = useWallet()
  const { connection } = useConnection()
  const router = useRouter()
  const pathname = usePathname()
  const formRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState<FormDataType>(DEFAULT_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressStep, setProgressStep] = useState(0)
  const [tokenResult, setTokenResult] = useState<TokenResult | null>(null)
  const [totalFee, setTotalFee] = useState<number>(0.4) // Initial fee calculation with all defaults
  const [formSubmitAttempted, setFormSubmitAttempted] = useState(false) // Track form submission attempts
  const [cancelled, setCancelled] = useState(false) // Track if token creation was cancelled

  // Register all useEffects before any conditional rendering

  // Check if we're on the success page and add window event listener for navigation
  useEffect(() => {
    // Handle clicks on "Create Token" when on success page
    if (tokenResult) {
      const handleCreateTokenClick = (e: MouseEvent) => {
        // Check if the clicked element or its parent is the "Create Token" link
        const target = e.target as HTMLElement;
        const link = target.closest('a[href="/create-token"]');
        
        if (link) {
          e.preventDefault();
          window.location.href = '/create-token';
        }
      };
      
      window.addEventListener('click', handleCreateTokenClick);
      return () => window.removeEventListener('click', handleCreateTokenClick);
    }
  }, [tokenResult]);

  // Reset form when navigating to this page
  useEffect(() => {
    if (pathname === '/create-token') {
      // Reset the session UUID to ensure clean state
      resetSessionUuid();
      setFormData(DEFAULT_FORM_DATA)
      setTokenResult(null)
      setError(null)
      setCancelled(false)
      setFormSubmitAttempted(false)
      setIsSubmitting(false)
    }
  }, [pathname])

  // Force reset form state completely when coming directly to the create-token page
  useEffect(() => {
    // Check if we're accessing the page directly (through URL or refresh)
    const isDirectNavigation = window.performance
      ?.getEntriesByType('navigation')
      .some((nav: any) => ['reload', 'navigate'].includes(nav.type));

    if (isDirectNavigation && pathname === '/create-token') {
      // Reset all state
      resetSessionUuid();
      setFormData(DEFAULT_FORM_DATA)
      setTokenResult(null)
      setError(null)
      setCancelled(false)
      setFormSubmitAttempted(false)
      setIsSubmitting(false)
    }
  }, [pathname])

  // Calculate fee whenever relevant form options change
  useEffect(() => {
    const fee = calculateFee({
      revokeMint: formData.revokeMint,
      revokeFreeze: formData.revokeFreeze,
      revokeUpdate: formData.revokeUpdate,
      socialLinks: formData.socialLinks,
      creatorInfo: formData.creatorInfo,
    })
    console.log("Calculated fee:", fee, "with options:", {
      revokeMint: formData.revokeMint,
      revokeFreeze: formData.revokeFreeze,
      revokeUpdate: formData.revokeUpdate,
      socialLinks: formData.socialLinks,
      creatorInfo: formData.creatorInfo,
    })
    setTotalFee(fee)
  }, [
    formData.revokeMint,
    formData.revokeFreeze,
    formData.revokeUpdate,
    formData.socialLinks,
    formData.creatorInfo,
  ])

  // Scroll to top effect for success and loading states
  useEffect(() => {
    if (isSubmitting || tokenResult) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0; // For Safari
    }
  }, [isSubmitting, tokenResult]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    
    console.log(`Input changed: ${name} = ${type === 'checkbox' ? checked : value}`)
    
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value)
          : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, logo: e.target.files![0] }))
    }
  }

  // Function to validate form data before submission
  const validateForm = (): string | null => {
    if (!walletAdapter.connected) {
      return "Please connect your wallet first";
    }
    if (!formData.logo) {
      return "Please upload a logo image";
    }
    if (!formData.name || formData.name.trim() === '') {
      return "Token name is required";
    }
    if (!formData.symbol || formData.symbol.trim() === '') {
      return "Token symbol is required";
    }
    if (!formData.description || formData.description.trim() === '') {
      return "Token description is required";
    }
    return null;
  };

  // Handle cancellation from the loading screen
  const handleCancel = useCallback(() => {
    console.log("Cancel button clicked by user");
    setCancelled(true);
    setIsSubmitting(false);
    setError("Token creation was cancelled.");
    resetSessionUuid(); // Make sure to reset session UUID
    
    // Scroll back to the form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      
      // Reset from any previous canceled state
      setCancelled(false);
      
      // Mark that a submission attempt was made
      setFormSubmitAttempted(true)
      
      // Clear previous errors and reset cancellation state
      setError(null)
      
      // Validate form
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        // Ensure we have a clean session before starting
        resetSessionUuid();
        
        setIsSubmitting(true)
        setProgressStep(0)
        
        // Force scroll to top when starting the loading process
        window.scrollTo(0, 0);
        document.body.scrollTop = 0; // For Safari

        const result = await createTokenWithMetadata(
          walletAdapter,
          formData,
          totalFee, // Pass the calculated total fee
          (step) => {
            // Skip progress updates if cancelled
            if (!cancelled) {
              setProgressStep(step);
              // Keep ensuring we're at the top for each step
              window.scrollTo(0, 0);
            }
          }
        )
        setTokenResult(result)
        // Ensure we're at the top for the success screen too
        window.scrollTo(0, 0);
      } catch (err: any) {
        console.error("Token creation error:", err)
        setError(err.message || "Unknown error occurred during token creation")
        
        // Scroll back to the form on error
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } finally {
        if (!cancelled) {
          setIsSubmitting(false)
        }
      }
    },
    [walletAdapter, formData, totalFee, cancelled]
  )

  // Render based on current state
  if (tokenResult) {
    return <TokenCreationSuccess result={tokenResult} />
  }

  if (isSubmitting) {
    return (
      <Loading
        message="Creating Your Token"
        steps={STEPS}
        currentStepIndex={progressStep}
        onCancel={handleCancel}
      />
    )
  }

  // If wallet is not connected, use the shared WalletRequired component
  if (!walletAdapter.connected) {
    return <WalletRequired message="Please connect your wallet to create a new Solana token" />;
  }

  // Calculate net fee after Solana network fee
  const netFee = Math.max(totalFee - SOLANA_NETWORK_FEE, 0);

  return (
    <div ref={formRef}>
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto space-y-6 p-6 bg-[#171717] rounded-xl my-12"
      >
        {error && (
          <div className="text-red-400 bg-red-800/30 p-3 rounded mb-4">{error}</div>
        )}

        <TokenFormBasic
          formData={formData}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          formSubmitted={formSubmitAttempted}
        />

        <TokenFormOptions
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
        />

        {formData.creatorInfo && (
          <TokenFormCreator
            formData={formData}
            handleInputChange={handleInputChange}
          />
        )}

        <TokenFormAuthorities
          formData={formData}
          setFormData={setFormData}
        />

        {/* Display dynamic feature‐fee total */}
        <div className="flex justify-between items-center text-gray-300">
          <span>Total fee:</span>
          <span className="text-purple-500 font-semibold">
            {formatFee(totalFee)}
          </span>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-full text-white font-medium transition cursor-pointer bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
        >
          Launch Token
        </button>
      </form>
    </div>
  )
}