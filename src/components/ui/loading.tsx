'use client';

import { useState, useEffect } from 'react';

interface LoadingProps {
  message?: string;
  steps?: string[];
}

export default function Loading({ message = 'Loading...', steps }: LoadingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    if (!steps || steps.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [steps]);
  
  if (!steps || steps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-purple-500 border-opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
        </div>
        <div className="text-white text-lg">{message}</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-purple-500 border-opacity-30"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
      </div>
      
      <div className="text-white text-lg mb-6">{message}</div>
      
      <div className="w-full max-w-md bg-[#222] rounded-lg p-4">
        <ul className="space-y-3">
          {steps.map((step, index) => (
            <li 
              key={index} 
              className={`flex items-center ${index <= currentStep ? 'text-white' : 'text-gray-500'}`}
            >
              {index < currentStep ? (
                <span className="w-6 h-6 mr-3 flex items-center justify-center bg-green-500 rounded-full text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </span>
              ) : index === currentStep ? (
                <span className="w-6 h-6 mr-3 flex-shrink-0 flex items-center justify-center border-2 border-purple-500 rounded-full">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                </span>
              ) : (
                <span className="w-6 h-6 mr-3 flex-shrink-0 flex items-center justify-center border-2 border-gray-600 rounded-full"></span>
              )}
              
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}