'use client';

import React from 'react';

interface PageLoaderProps {
  isLoading: boolean;
}

const PageLoader: React.FC<PageLoaderProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col justify-center items-center transition-all duration-300 backdrop-blur-sm">
      <div className="relative">
        {/* SVG Loader Animation */}
        <svg
          className="w-16 h-16"
          viewBox="0 0 38 38"
          xmlns="http://www.w3.org/2000/svg"
          stroke="#3b82f6" // Blue-500 color
        >
          <g fill="none" fillRule="evenodd">
            <g transform="translate(1 1)" strokeWidth="2">
              <circle strokeOpacity=".3" cx="18" cy="18" r="18" />
              <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 18 18"
                  to="360 18 18"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </g>
        </svg>
        
        {/* Pulse Animation */}
        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-15"></div>
      </div>
      
      {/* Loading Text */}
      <p className="mt-6 text-blue-600 font-medium text-lg animate-pulse">
        Chargement...
      </p>
    </div>
  );
};

export default PageLoader; 