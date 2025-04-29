"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useRouter, usePathname } from "next/navigation";
import { createTokenWithMetadata } from "@/services/token-service";
import {
  calculateFee,
  formatFee,
  getOriginalPrice,
} from "@/services/fee-service";
import TokenCreationSuccess from "./token-creation-success";
import Loading from "../ui/loading";
import TokenFormBasic from "./token-form-basic";
import TokenFormOptions from "./token-form-options";
import TokenFormAuthorities from "./token-form-authorities";
import TokenFormCreator from "./token-form-creator";
import WalletRequired from "../wallet/wallet-required";
import { FormDataType, TokenResult } from "@/types/token";
import { SOLANA_NETWORK_FEE } from "@/config";
import { resetSessionUuid } from "@/services/ipfs-service";
import { FEE_CONSTANTS } from "@/services/fee-service";

// Humorous loading steps related to meme coins
const STEPS = [
  "Bribing crypto influencers...",
  "Planning the perfect rug pull...",
  "Pumping your bags to the moon...",
  "Dumping on the degens at 3 AM...",
  "Hiring shills for max FOMO...",
  "Coding a 99% dev tax, oops...",
  "Tweeting 'LFG' for clout...",
];

const DEFAULT_FORM_DATA: FormDataType = {
  name: "",
  symbol: "",
  decimals: 9,
  supply: 1_000_000_000,
  description: "",
  logo: null,
  revokeMint: true, // At least one authority is enabled by default
  revokeFreeze: true,
  revokeUpdate: true,
  socialLinks: false,
  creatorInfo: false,
  creatorName: "SolHype", // Default creator name
  website: "",
  twitter: "",
  telegram: "",
  discord: "",
  largeImageSize: false, // New field for large image toggle
};

// Image size limits in bytes
const IMAGE_SIZE_LIMITS = {
  DEFAULT: 500 * 1024, // 500KB
  LARGE: 10 * 1024 * 1024, // 10MB
};

export default function TokenForm() {
  const walletAdapter = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormDataType>(DEFAULT_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);
  const [tokenResult, setTokenResult] = useState<TokenResult | null>(null);
  const [totalFee, setTotalFee] = useState<number>(0.4); // Initial fee calculation with all defaults
  const [formSubmitAttempted, setFormSubmitAttempted] = useState(false); // Track form submission attempts
  const [cancelled, setCancelled] = useState(false); // Track if token creation was cancelled
  const [imageSizeError, setImageSizeError] = useState<string | null>(null);

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
          window.location.href = "/create-token";
        }
      };

      window.addEventListener("click", handleCreateTokenClick);
      return () => window.removeEventListener("click", handleCreateTokenClick);
    }
  }, [tokenResult]);

  // Reset form when navigating to this page
  useEffect(() => {
    if (pathname === "/create-token") {
      // Reset the session UUID to ensure clean state
      resetSessionUuid();
      setFormData(DEFAULT_FORM_DATA);
      setTokenResult(null);
      setError(null);
      setCancelled(false);
      setFormSubmitAttempted(false);
      setIsSubmitting(false);
      setImageSizeError(null);
    }
  }, [pathname]);

  // Force reset form state completely when coming directly to the create-token page
  useEffect(() => {
    // Check if we're accessing the page directly (through URL or refresh)
    const isDirectNavigation = window.performance
      ?.getEntriesByType("navigation")
      .some((nav: any) => ["reload", "navigate"].includes(nav.type));

    if (isDirectNavigation && pathname === "/create-token") {
      // Reset all state
      resetSessionUuid();
      setFormData(DEFAULT_FORM_DATA);
      setTokenResult(null);
      setError(null);
      setCancelled(false);
      setFormSubmitAttempted(false);
      setIsSubmitting(false);
      setImageSizeError(null);
    }
  }, [pathname]);

  // Calculate fee whenever relevant form options change
  useEffect(() => {
    const fee = calculateFee({
      revokeMint: formData.revokeMint,
      revokeFreeze: formData.revokeFreeze,
      revokeUpdate: formData.revokeUpdate,
      socialLinks: formData.socialLinks,
      creatorInfo: formData.creatorInfo,
      largeImageSize: formData.largeImageSize,
    });

    setTotalFee(fee);
  }, [
    formData.revokeMint,
    formData.revokeFreeze,
    formData.revokeUpdate,
    formData.socialLinks,
    formData.creatorInfo,
    formData.largeImageSize,
  ]);

  // Scroll to top effect for success and loading states
  useEffect(() => {
    if (isSubmitting || tokenResult) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0; // For Safari
    }
  }, [isSubmitting, tokenResult]);

  // Effect to scroll to logo input when there's a logo error
  useEffect(() => {
    if ((error && error.includes("logo")) || imageSizeError) {
      logoInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [error, imageSizeError]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    // Normal form field handling without special cases
    // The special logic for largeImageSize is now handled directly in the toggle button's onClick
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value)
          : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeLimit = formData.largeImageSize
        ? IMAGE_SIZE_LIMITS.LARGE
        : IMAGE_SIZE_LIMITS.DEFAULT;

      // Hard cap at 10MB regardless of settings
      const hardCap = IMAGE_SIZE_LIMITS.LARGE;

      // Check if the file exceeds the hard cap
      if (file.size > hardCap) {
        setImageSizeError(`The image is too large. Maximum size is 10MB.`);
        // Reset the file input
        e.target.value = "";
        return;
      }

      // Check if the file size is within the current limit
      if (file.size > sizeLimit) {
        if (formData.largeImageSize) {
          // Should never happen due to the hard cap check above
          setImageSizeError(`The image is too large. Maximum size is 10MB.`);
        } else {
          // If in default mode and too big, but could use large image option
          setImageSizeError(
            `The image is too large (${(file.size / (1024 * 1024)).toFixed(
              2
            )}MB). ` +
              `Enable large image size option below for an additional fee.`
          );
        }
        // Reset the file input
        e.target.value = "";
        return;
      }

      // Clear any previous size errors
      setImageSizeError(null);

      // Set the logo in form data
      setFormData((prev) => ({ ...prev, logo: file }));

      console.log(
        `File accepted: ${file.name}, size: ${(file.size / 1024).toFixed(
          2
        )}KB, largeImageSize: ${formData.largeImageSize}`
      );
    }
  };

  // Function to validate form data before submission
  const validateForm = (): string | null => {
    if (!walletAdapter.connected) {
      return "Please connect your wallet first";
    }

    // Check if wallet supports sendTransaction method (Phantom compatibility)
    if (!walletAdapter.sendTransaction) {
      return "Your wallet doesn't support the required transaction method. Please use Phantom wallet for best compatibility.";
    }

    if (!formData.logo) {
      return "Please upload a logo image";
    }
    if (!formData.name || formData.name.trim() === "") {
      return "Token name is required";
    }
    if (!formData.symbol || formData.symbol.trim() === "") {
      return "Token symbol is required";
    }
    if (!formData.description || formData.description.trim() === "") {
      return "Token description is required";
    }

    // Make sure image size limits are respected
    if (formData.logo) {
      const sizeLimit = formData.largeImageSize
        ? IMAGE_SIZE_LIMITS.LARGE
        : IMAGE_SIZE_LIMITS.DEFAULT;

      if (formData.logo.size > sizeLimit) {
        if (formData.largeImageSize) {
          return `The image is too large. Maximum size is 10MB.`;
        } else {
          return `The image is too large. Enable large image size option or choose a smaller image.`;
        }
      }
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
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Reset from any previous canceled state
      setCancelled(false);

      // Mark that a submission attempt was made
      setFormSubmitAttempted(true);

      // Clear previous errors and reset cancellation state
      setError(null);

      // Validate form
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        // Ensure we have a clean session before starting
        resetSessionUuid();

        setIsSubmitting(true);
        setProgressStep(0);

        // Force scroll to top when starting the loading process
        window.scrollTo(0, 0);
        document.body.scrollTop = 0; // For Safari

        // Add explicit check for Phantom compatibility
        if (!walletAdapter.sendTransaction) {
          throw new Error(
            "This wallet doesn't support the signAndSendTransaction method required by Phantom. Please use Phantom wallet for best compatibility."
          );
        }

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
        );
        setTokenResult(result);
        // Ensure we're at the top for the success screen too
        window.scrollTo(0, 0);
      } catch (err: any) {
        console.error("Token creation error:", err);
        setError(err.message || "Unknown error occurred during token creation");

        // Scroll back to the form on error
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } finally {
        if (!cancelled) {
          setIsSubmitting(false);
        }
      }
    },
    [walletAdapter, formData, totalFee, cancelled]
  );

  // Render based on current state
  if (tokenResult) {
    return <TokenCreationSuccess result={tokenResult} />;
  }

  if (isSubmitting) {
    return (
      <Loading
        message="Creating Your Meme Coin"
        steps={STEPS}
        currentStepIndex={progressStep}
        onCancel={handleCancel}
      />
    );
  }

  // If wallet is not connected, use the shared WalletRequired component
  if (!walletAdapter.connected) {
    return (
      <WalletRequired message="Please connect your wallet to create a new Solana token" />
    );
  }

  // Calculate net fee after Solana network fee
  const netFee = Math.max(totalFee - SOLANA_NETWORK_FEE, 0);

  return (
    <div ref={formRef}>
      {/* Instructions header */}
      <div className="max-w-3xl mx-auto mb-6 p-6 bg-[#171717] rounded-xl mt-12 border-l-4 border-purple-500">
        <h2 className="text-2xl font-bold mb-3 text-white">
          Create Your Meme Coin
        </h2>
        <p className="text-gray-300 mb-4">
          Launch your viral meme coin in minutes! Fill out the form below to
          create a new Solana token with your own branding and customizations.
        </p>
        <ul className="text-gray-400 space-y-2 ml-6 list-disc">
          <li>Upload a catchy logo - this is what everyone will see!</li>
          <li>Choose a memorable name and symbol for your token</li>
          <li>Revoke authorities to build trust with your future community</li>
          <li>Add social links to start building your following</li>
        </ul>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto space-y-6 p-6 bg-[#171717] rounded-xl mb-12"
      >
        {error && (
          <div className="text-red-400 bg-red-800/30 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div ref={logoInputRef}>
          <TokenFormBasic
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileChange={handleFileChange}
            formSubmitted={formSubmitAttempted}
            imageSizeError={imageSizeError}
            sizeLimit={
              formData.largeImageSize
                ? IMAGE_SIZE_LIMITS.LARGE
                : IMAGE_SIZE_LIMITS.DEFAULT
            }
          />

          {/* Large Image Size Toggle */}
          <div className="toggle-section mb-4 mt-2">
            <div className="toggle-section-header flex justify-between items-center mb-2">
              <div className="toggle-header-left flex items-center">
                <div className="toggle-wrapper mr-3">
                  <input
                    id="largeImageSize"
                    type="checkbox"
                    name="largeImageSize"
                    checked={formData.largeImageSize}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <div
                    className={`toggle w-12 h-6 rounded-full p-1 cursor-pointer ${
                      formData.largeImageSize ? "bg-purple-600" : "bg-gray-700"
                    }`}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        largeImageSize: !prev.largeImageSize,
                        logo: null, // Clear the logo when toggling
                      }));

                      // Clear any logo-related errors
                      setImageSizeError(null);
                      if (error?.includes("logo")) {
                        setError(null);
                      }

                      // Reset the file input to clear any previous file selection
                      const fileInput = document.querySelector(
                        'input[type="file"]'
                      ) as HTMLInputElement;
                      if (fileInput) {
                        fileInput.value = "";
                      }
                    }}
                  >
                    <div
                      className={`toggle-marker h-4 w-4 bg-white rounded-full transform transition-transform ${
                        formData.largeImageSize ? "translate-x-6" : ""
                      }`}
                    ></div>
                  </div>
                </div>
                <div className="toggle-label text-gray-300 mr-3">
                  Large Image Size (Optional)
                </div>
              </div>
              <div className="toggle-cost flex items-center">
                <span className="text-gray-500 line-through mr-2">
                  {FEE_CONSTANTS.ORIGINAL_FEATURE_FEE.toFixed(2)} SOL
                </span>
                <span className="text-purple-500">
                  {FEE_CONSTANTS.LARGE_IMAGE_FEE.toFixed(2)} SOL
                </span>
              </div>
            </div>
            <div className="toggle-section-description text-xs text-gray-500">
              {formData.largeImageSize
                ? "Large image size enabled (up to 10MB). Please upload your image again."
                : "Enable this option to use images up to 10MB (default limit is 500KB)."}
            </div>
          </div>
        </div>

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

        <TokenFormAuthorities formData={formData} setFormData={setFormData} />

        {/* Display dynamic feature‐fee total */}
        <div className="bg-[#222] p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center text-gray-300 mb-2">
            <span className="flex items-center">
              <span>Total fee:</span>
              <div className="bg-green-900/30 text-green-300 text-xs px-2 py-1 rounded ml-2">
                50% OFF
              </div>
            </span>
            <div className="flex items-center">
              <span className="text-gray-500 line-through mr-2">
                {getOriginalPrice({
                  revokeMint: formData.revokeMint,
                  revokeFreeze: formData.revokeFreeze,
                  revokeUpdate: formData.revokeUpdate,
                  socialLinks: formData.socialLinks,
                  creatorInfo: formData.creatorInfo,
                  largeImageSize: formData.largeImageSize,
                }).toFixed(2)}{" "}
                SOL
              </span>
              <span className="text-purple-500 font-semibold">
                {formatFee(totalFee)}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Fee includes transaction costs and token creation service. Limited
            time 50% discount applied!
          </div>
        </div>

        {/* Include Phantom Wallet Recommendation */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-blue-300 text-sm">
                For the best experience, we recommend using the{" "}
                <strong>Phantom wallet</strong>. Some other wallets may display
                security warnings.
              </p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-full text-white font-medium transition cursor-pointer bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
        >
          Launch Token
        </button>

        {/* Added submission note */}
        <div className="text-center text-gray-500 text-sm pt-2">
          Click to launch your token and approve the transaction in your wallet
        </div>
      </form>
    </div>
  );
}
