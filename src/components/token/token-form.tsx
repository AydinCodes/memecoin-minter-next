// src/components/token/token-form.tsx

"use client"

import { useState, useCallback } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import {
  createTokenWithMetadataManual,
  FormDataType,
  TokenResult,
} from "@/services/manual-token-service"
import TokenCreationSuccess from "./token-creation-success"
import Loading from "../ui/loading"
import TokenFormBasic from "./token-form-basic"
import TokenFormOptions from "./token-form-options"
import TokenFormAuthorities from "./token-form-authorities"

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
    website: "",
    twitter: "",
    telegram: "",
    discord: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenCreationResult, setTokenCreationResult] = useState<TokenResult | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseInt(value) : value,
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
        setError("Please upload a logo")
        return
      }

      setIsSubmitting(true)
      try {
        const result = await createTokenWithMetadataManual(
          walletAdapter,
          formData as FormDataType
        )
        setTokenCreationResult(result)
      } catch (err: any) {
        setError(err.message || "An unknown error occurred")
      } finally {
        setIsSubmitting(false)
      }
    },
    [walletAdapter, formData]
  )

  if (tokenCreationResult) {
    return <TokenCreationSuccess result={tokenCreationResult} />
  }
  if (isSubmitting) {
    return (
      <Loading
        message="Creating your token..."
        steps={[
          "Uploading image…",
          "Uploading metadata…",
          "Processing payment…",
          "Creating mint & ATA…",
          "Minting supply & revoking…",
        ]}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="token-creation-box max-w-3xl mx-auto bg-[#171717] p-6 rounded-xl shadow-xl">
      {error && (
        <div className="error-alert bg-red-500 bg-opacity-20 border border-red-500 text-white p-3 mb-4">
          {error}
        </div>
      )}

      <TokenFormBasic formData={formData as FormDataType} handleInputChange={handleInputChange} handleFileChange={handleFileChange} />

      <div className="my-6 border-t border-gray-700" />

      <TokenFormOptions formData={formData as FormDataType} setFormData={setFormData as any} handleInputChange={handleInputChange} />

      <div className="my-6 border-t border-gray-700" />

      <TokenFormAuthorities formData={formData as FormDataType} setFormData={setFormData as any} />

      <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
        <button
          type="submit"
          disabled={!walletAdapter.connected || isSubmitting}
          className={`w-full md:w-auto py-3 px-8 rounded-full font-medium transition-all ${
            walletAdapter.connected
              ? "bg-gradient-to-r from-purple-600 to-blue-500 hover:shadow-lg"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          {walletAdapter.connected ? "Launch Token" : "Connect Wallet to Launch"}
        </button>
      </div>
    </form>
  )
}
