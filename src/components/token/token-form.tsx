// src/components/token/token-form.tsx

"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
  createTokenWithMetadata,
  FormDataType,
  TokenResult,
} from "@/services/token-service"
import { calculateFee } from "@/services/fee-service"
import TokenCreationSuccess from "./token-creation-success"
import Loading from "../ui/loading"
import TokenFormBasic from "./token-form-basic"
import TokenFormOptions from "./token-form-options"
import TokenFormAuthorities from "./token-form-authorities"

const STEPS = [
  "Uploading token image…",
  "Creating token metadata…",
  "Processing payment…",
  "Creating mint & ATA & mintTo…",
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
    website: "",
    twitter: "",
    telegram: "",
    discord: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressStep, setProgressStep] = useState(0)
  const [tokenResult, setTokenResult] = useState<TokenResult | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
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

      if (!walletAdapter.connected) {
        setError("Please connect your wallet first")
        return
      }
      if (!formData.logo) {
        setError("Please upload a logo image")
        return
      }

      setIsSubmitting(true)
      setProgressStep(0)

      try {
        const result = await createTokenWithMetadata(
          walletAdapter,
          formData,
          (step) => setProgressStep(step)
        )
        setTokenResult(result)
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setIsSubmitting(false)
      }
    },
    [walletAdapter, formData]
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
        <div className="text-red-400 bg-red-800/30 p-3 rounded">{error}</div>
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

      <TokenFormAuthorities
        formData={formData}
        setFormData={setFormData}
      />

      {/* Display dynamic feature‐fee total */}
      <div className="flex justify-between items-center text-gray-300">
        <span>Total feature fee:</span>
        <span className="text-purple-500 font-semibold">
          {calculateFee({
            revokeMint: formData.revokeMint,
            revokeFreeze: formData.revokeFreeze,
            revokeUpdate: formData.revokeUpdate,
            socialLinks: formData.socialLinks,
            creatorInfo: formData.creatorInfo,
          })}{" "}
          SOL
        </span>
      </div>
      <div className="text-xs text-gray-500">
        (Network transaction fees are separate and go to validators)
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
