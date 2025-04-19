"use client"

import { useState, useCallback, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
  createTokenWithMetadata,
  FormDataType,
  TokenResult,
} from "@/services/token-service"
import { calculateFee, formatFee } from "@/services/fee-service"
import TokenCreationSuccess from "./token-creation-success"
import Loading from "../ui/loading"
import TokenFormBasic from "./token-form-basic"
import TokenFormOptions from "./token-form-options"
import TokenFormAuthorities from "./token-form-authorities"
import TokenFormCreator from "./token-form-creator"

const STEPS = [
  "Uploading token image…",
  "Creating token metadata…",
  "Processing transaction…",
  "Creating mint & token account…",
  "Adding on‐chain metadata…",
  "Configuring token authorities…",
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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      try {
        if (!walletAdapter.connected) {
          setError("Please connect your wallet first")
          return
        }
        if (!formData.logo) {
          setError("Please upload a logo image")
          return
        }
        if (!formData.name || formData.name.trim() === '') {
          setError("Token name is required")
          return
        }
        if (!formData.symbol || formData.symbol.trim() === '') {
          setError("Token symbol is required")
          return
        }
        if (!formData.description || formData.description.trim() === '') {
          setError("Token description is required")
          return
        }

        // Ensure all authority options are checked
        if (!formData.revokeMint || !formData.revokeFreeze || !formData.revokeUpdate) {
          setError("All authority options (Mint, Freeze, Update) must be checked for a successful token creation")
          return
        }

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
      <div className="text-xs text-gray-500">
        (Single transaction includes all network fees)
      </div>

      <button
        type="submit"
        disabled={!walletAdapter.connected}
        className={`w-full py-3 rounded-full text-white font-medium transition ${
          walletAdapter.connected
            ? "bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
            : "bg-gray-600 cursor-not-allowed"
        }`}
      >
        {walletAdapter.connected ? "Launch Token" : "Connect Wallet"}
      </button>
    </form>
  )
}