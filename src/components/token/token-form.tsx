// src/components/token/token-form.tsx

"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
  createTokenWithMetadata,
  FormDataType,
  TokenResult,
} from "@/services/token-service"
import TokenCreationSuccess from "./token-creation-success"
import Loading from "../ui/loading"
import TokenFormBasic from "./token-form-basic"
import TokenFormOptions from "./token-form-options"
import TokenFormAuthorities from "./token-form-authorities"

const STEPS = [
  "Uploading token image…",
  "Creating token metadata…",
  "Processing payment…",
  "Creating token on Solana…",
  "Configuring token authorities…",
]

export default function TokenForm() {
  const walletAdapter = useWallet()
  const { connection } = useConnection()

  const [formData, setFormData] = useState<Partial<FormDataType>>({
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
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progressStep, setProgressStep] = useState<number>(0)
  const [tokenResult, setTokenResult] = useState<TokenResult | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData((p) => ({
      ...p,
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
      setFormData((p) => ({ ...p, logo: e.target.files![0] }))
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
          formData as FormDataType,
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
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 p-6 bg-[#171717] rounded-xl">
      {error && (
        <div className="text-red-400 bg-red-800/30 p-3 rounded">{error}</div>
      )}

      <TokenFormBasic
        formData={formData as FormDataType}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
      />

      <TokenFormOptions
        formData={formData as FormDataType}
        setFormData={setFormData as any}
        handleInputChange={handleInputChange}
      />

      <TokenFormAuthorities
        formData={formData as FormDataType}
        setFormData={setFormData as any}
      />

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
