// src/app/support/page.tsx

"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setSubmitError("Screenshot must be less than 2MB");
        e.target.value = "";
        return;
      }
      
      setScreenshot(file);
      setSubmitError(null);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create form data to send file
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("message", message);
      if (screenshot) {
        formData.append("screenshot", screenshot);
      }

      const response = await fetch("/api/support", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit support request");
      }

      // Clear form and show success message
      setName("");
      setEmail("");
      setMessage("");
      setScreenshot(null);
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error submitting support request:", error);
      setSubmitError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Support Request
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Need help with your meme coin or token? Fill out the form below and our team will get back to you as soon as possible.
          </p>
        </motion.div>

        {submitSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#171717] rounded-xl p-8 shadow-lg border border-green-500/30 text-center"
          >
            <div className="w-20 h-20 mx-auto bg-green-900/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Support Request Sent!</h2>
            <p className="text-gray-300 mb-6">
              Thank you for reaching out. Our team will review your request and get back to you as soon as possible.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/"
                className="bg-transparent border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white text-lg font-medium py-2 px-8 rounded-full transition-colors"
              >
                Back to Home
              </Link>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="bg-transparent border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white text-lg font-medium py-2 px-8 rounded-full transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#171717] rounded-xl p-8 shadow-lg border border-gray-800"
          >
            {submitError && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 mb-6 rounded-lg">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="Your first name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Message</label>
                <textarea
                  className="w-full bg-[#222] border border-gray-700 rounded-lg p-3 text-white h-32"
                  placeholder="Describe your issue or question in detail"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Screenshot (Optional)</label>
                <div
                  className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
                  onClick={triggerFileInput}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <span className="material-symbols-rounded text-3xl mb-2 text-gray-400 block">upload</span>
                  {screenshot ? (
                    <div>
                      <p className="text-green-400">{screenshot.name}</p>
                      <p className="text-xs text-gray-500">
                        {(screenshot.size / (1024 * 1024)).toFixed(2)}MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <span className="block text-gray-300 mb-1">Click here to upload a screenshot</span>
                      <div className="text-xs text-gray-500">
                        Maximum size: 2MB
                      </div>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-full text-white font-medium transition cursor-pointer bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Submitting..." : "Send Support Request"}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}