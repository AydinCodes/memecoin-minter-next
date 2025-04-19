// src/components/ui/loading.tsx

'use client'

import React from 'react'

interface LoadingProps {
  message?: string
  steps?: string[]
  /** If provided, controls which step is active; disables auto‐advance */
  currentStepIndex?: number
}

export default function Loading({
  message = 'Loading...',
  steps = [],
  currentStepIndex,
}: LoadingProps) {
  const stepIndex = currentStepIndex != null ? currentStepIndex : 0

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-opacity-30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
      </div>

      <div className="text-white text-lg mb-6">{message}</div>

      <ul className="w-full max-w-md space-y-3">
        {steps.map((step, idx) => {
          const isDone = idx < stepIndex
          const isActive = idx === stepIndex

          return (
            <li
              key={idx}
              className={`flex items-center text-sm ${
                isDone
                  ? 'text-white'
                  : isActive
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
            >
              {isDone ? (
                <span className="w-6 h-6 mr-3 flex items-center justify-center bg-green-500 rounded-full text-white">
                  ✓
                </span>
              ) : isActive ? (
                <span className="w-6 h-6 mr-3 flex items-center justify-center border-2 border-purple-500 rounded-full">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                </span>
              ) : (
                <span className="w-6 h-6 mr-3 flex items-center justify-center border-2 border-gray-600 rounded-full"></span>
              )}
              <span>{step}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
