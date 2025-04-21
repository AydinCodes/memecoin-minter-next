"use client"

import { useState, useCallback, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
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
import { FormDataType, TokenResult } from "@/types/token"
import { SOLANA_NETWORK_FEE } from "@/config"

// Enhanced steps with more detail on IPFS operations
const STEPS = [
  "Uploading token image to IPFS…",
  "Creating token metadata…",
  "Processing transaction…",
  "Creating mint & token account…",
  "Adding on‐chain metadata…",
  "Configuring token authorities…",
  "Updating metadata with mint address…",
]

export default function TokenForm() {
  const walletAdapter = useWallet()
  const { connection } = useConnection()

  const [formData, setFormData] = useState<FormDataType>({
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
    creatorName: "SolMinter", // Default creator name
    website: "",
    twitter: "",
    telegram: "",
    discord: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressStep, setProgressStep] = useState(0)
  const [tokenResult, setTokenResult] = useState<TokenResult | null>(null)
  const [totalFee, setTotalFee] = useState<number>(0.4) // Initial fee calculation with all defaults (0.1 base + 0.3 for all authorities)
  const [formSubmitAttempted, setFormSubmitAttempted] = useState(false) // Track form submission attempts

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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      
      // Mark that a submission attempt was made
      setFormSubmitAttempted(true)
      
      // Clear previous errors
      setError(null)
      
      // Validate form
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        setIsSubmitting(true)
        setProgressStep(0)

        const result = await createTokenWithMetadata(
          walletAdapter,
          formData,
          totalFee, // Pass the calculated total fee
          (step) => setProgressStep(step)
        )
        setTokenResult(result)
      } catch (err: any) {
        console.error("Token creation error:", err)
        setError(err.message || "Unknown error occurred during token creation")
      } finally {
        setIsSubmitting(false)
      }
    },
    [walletAdapter, formData, totalFee]
  )

  if (tokenResult) {
    return <TokenCreationSuccess result={tokenResult} />
  }

  if (isSubmitting) {
    return (
      <Loading
        message="Creating your token..."
        steps={STEPS}
        currentStepIndex={progressStep}
      />
    )
  }

  // Calculate net fee after Solana network fee
  const netFee = Math.max(totalFee - SOLANA_NETWORK_FEE, 0);

  // If wallet is not connected, show a better wallet connection UI
  if (!walletAdapter.connected) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 p-10 bg-[#171717] rounded-xl text-center">
        <div className="w-20 h-20 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-8">
          Please connect your wallet to create a new Solana token
        </p>
        
        <div className="flex justify-center">
          <WalletMultiButton className="wallet-adapter-button-trigger !bg-gradient-to-r from-purple-600 to-blue-500 !rounded-full transition-all hover:shadow-lg" />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto space-y-6 p-6 bg-[#171717] rounded-xl"
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
      <div className="text-xs text-gray-500 flex justify-between">
        <span>(Includes Solana network fee: {formatFee(SOLANA_NETWORK_FEE)})</span>
        <span>Net fee: {formatFee(netFee)}</span>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-full text-white font-medium transition cursor-pointer bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
      >
        Launch Token
      </button>
    </form>
  )
}