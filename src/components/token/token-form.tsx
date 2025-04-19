"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  createTokenWithMetadata,
  calculateFee,
} from "@/services/token-service";
import { validateTokenForm } from "@/utils/token-validation";
import { isWalletConnected } from "@/services/wallet-service";
import TokenCreationSuccess from "./token-creation-success";
import SocialLinksForm from "./social-links-form";
import TokenFormBasic from "./token-form-basic";
import TokenFormOptions from "./token-form-options";
import TokenFormAuthorities from "./token-form-authorities";
import Loading from "../ui/loading";

export default function TokenForm() {
  const { publicKey, connected, wallet } = useWallet();
  const { connection } = useConnection();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenCreationResult, setTokenCreationResult] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    decimals: 9,
    supply: 1000000000,
    description: "",
    logo: null as File | null,
    revokeMint: true,
    revokeFreeze: true,
    revokeUpdate: true,
    socialLinks: false,
    creatorInfo: false,
    website: "",
    twitter: "",
    telegram: "",
    discord: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked,
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseInt(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        logo: e.target.files[0],
      });
    }
  };

  const calculateTotalFee = () => {
    return calculateFee({
      revokeMint: formData.revokeMint,
      revokeFreeze: formData.revokeFreeze,
      revokeUpdate: formData.revokeUpdate,
      socialLinks: formData.socialLinks,
      creatorInfo: formData.creatorInfo,
    });
  };

  // Debugging function to check form and wallet state
  const debugFormState = () => {
    console.log("Form Data:", formData);
    console.log("Wallet Connected:", connected);
    console.log("Wallet:", wallet);
    console.log("Public Key:", publicKey?.toString());
    console.log("Is Wallet Connected:", isWalletConnected(wallet));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      debugFormState(); // Log debugging info

      setError(null);
      console.log("Form submission started");

      // Check if wallet is connected
      if (!connected || !wallet) {
        setError("Please connect your wallet first");
        console.log("Wallet not connected");
        return;
      }

      // Simplified wallet connection check
      if (!publicKey) {
        setError("Please connect your wallet first");
        console.log("No public key found");
        return;
      }

      // Validate form
      if (!formData.logo) {
        setError("Please upload a logo image for your token");
        console.log("Logo missing");
        return;
      }

      if (!formData.name || formData.name.trim() === "") {
        setError("Token name is required");
        console.log("Name missing");
        return;
      }

      if (!formData.symbol || formData.symbol.trim() === "") {
        setError("Token symbol is required");
        console.log("Symbol missing");
        return;
      }

      if (!formData.description || formData.description.trim() === "") {
        setError("Token description is required");
        console.log("Description missing");
        return;
      }

      // Check balance
      try {
        console.log("Checking balance...");
        const balance = await connection.getBalance(publicKey!);
        const requiredBalance = calculateTotalFee() * 1000000000; // Convert SOL to lamports
        console.log(
          `Balance: ${
            balance / 1000000000
          } SOL, Required: ${calculateTotalFee()} SOL`
        );

        if (balance < requiredBalance) {
          setError(
            `Insufficient SOL balance. You need at least ${calculateTotalFee()} SOL.`
          );
          console.log("Insufficient balance");
          return;
        }

        // Start token creation process
        setIsSubmitting(true);
        console.log("Starting token creation process...");

        // Define the steps for the loading component
        const steps = [
          "Uploading token image...",
          "Creating token metadata...",
          "Processing payment...",
          "Creating token on Solana...",
          "Configuring token authorities...",
        ];

        try {
          // Step 1: Upload image
          setCurrentStep(steps[0]);
          console.log("Step 1: Uploading image...");

          // Step 2: Create metadata
          setCurrentStep(steps[1]);
          console.log("Step 2: Creating metadata...");

          // Step 3: Process payment
          setCurrentStep(steps[2]);
          console.log("Step 3: Processing payment...");

          // Step 4: Create token
          setCurrentStep(steps[3]);
          console.log("Step 4: Creating token...");

          // Step 5: Configure authorities
          setCurrentStep(steps[4]);
          console.log("Step 5: Configuring authorities...");

          // Combined process
          const result = await createTokenWithMetadata(wallet, formData);
          console.log("Token creation successful:", result);
          setTokenCreationResult(result);
        } catch (error: any) {
          console.error("Error creating token:", error);
          setError(
            error?.message || "An unknown error occurred during token creation."
          );
        } finally {
          setIsSubmitting(false);
          setCurrentStep(null);
        }
      } catch (error: any) {
        console.error("Error in form submission:", error);
        setError(error?.message || "An unknown error occurred");
        setIsSubmitting(false);
      }
    },
    [connection, publicKey, wallet, connected, formData]
  );

  // If token creation was successful, show success component
  if (tokenCreationResult) {
    return <TokenCreationSuccess result={tokenCreationResult} />;
  }

  // If submitting, show loading with steps
  if (isSubmitting) {
    return (
      <Loading
        message="Creating your token..."
        steps={[
          "Uploading token image...",
          "Creating token metadata...",
          "Processing payment...",
          "Creating token on Solana...",
          "Configuring token authorities...",
        ]}
      />
    );
  }

  return (
    <div id="create-token" className="opacity-100 py-8">
      <div className="title-box text-center mb-8">
        <div className="title-text text-3xl md:text-4xl font-bold text-white mb-3">
          Solana Token Creator
        </div>
        <div className="title-desc text-gray-400">
          <span className="span-1 block">
            Create and deploy your Solana coin effortlessly in seconds.
          </span>
          <span className="span-2 block">
            Reach the world and scale without limits!
          </span>
        </div>
      </div>

      {error && (
        <div className="error-alert max-w-3xl mx-auto mb-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-3 text-white">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="token-creation-box max-w-3xl mx-auto bg-[#171717] rounded-xl p-6 shadow-xl"
      >
        {/* Basic token information section */}
        <TokenFormBasic
          formData={formData}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
        />

        <div className="form-divider border-t border-gray-700 my-6"></div>

        {/* Optional features section */}
        <TokenFormOptions
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
        />

        <div className="form-divider border-t border-gray-700 my-6"></div>

        {/* Authorities section */}
        <TokenFormAuthorities formData={formData} setFormData={setFormData} />

        {/* Submit section */}
        <div className="submit-section flex flex-col md:flex-row justify-between items-center mt-8">
          <button
            type="submit"
            className={`submit-btn bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-3 px-8 rounded-full hover:shadow-lg transition-all w-full md:w-auto mb-4 md:mb-0 ${
              !connected || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:scale-105 active:scale-95"
            }`}
            disabled={!connected || isSubmitting}
            onClick={(e) => {
              console.log("Button clicked!");
              if (connected && !isSubmitting) {
                // Add visual feedback
                const btn = e.currentTarget;
                btn.classList.add("animate-pulse");
                setTimeout(() => btn.classList.remove("animate-pulse"), 500);
              }
              handleSubmit(e);
            }}
          >
            {isSubmitting
              ? "Creating Token..."
              : connected
              ? "Launch Token"
              : "Connect Wallet to Launch"}
          </button>

          <div className="token-fees-container text-right">
            <div className="fees-label text-gray-400 text-sm">Total Fees:</div>
            <div className="flex items-center">
              <div className="fees-original text-gray-500 text-sm">
                0.2+<del>0.6 SOL</del>
              </div>
              <div className="fees-discounted text-purple-500 text-xl font-semibold ml-2">
                {calculateTotalFee()} SOL
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
