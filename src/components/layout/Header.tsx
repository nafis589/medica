'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavigationLink } from '../ui/NavigationLoader';

interface HeaderProps {
  showAuthButtons?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showAuthButtons = true }) => {
  const router = useRouter();
  
  const handleGoBack = () => {
    router.back();
  };
  
  return (
    <header className="bg-white py-4 px-6 relative">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Medica
        </Link>
        
        {showAuthButtons ? (
          <div className="space-x-4">
            <NavigationLink 
              href="/login" 
              className="px-4 py-2 text-blue-600 hover:text-blue-800 inline-block"
            >
              Sign In
            </NavigationLink>
            <NavigationLink
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
            >
              Create an Account
            </NavigationLink>
          </div>
        ) : (
          <button 
            onClick={handleGoBack}
            className="text-gray-600 hover:text-blue-600 transition-colors px-4 py-2 font-medium"
            aria-label="Go back"
          >
            Back
          </button>
        )}
      </div>
      
      {/* Elegant separator line with margins */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="h-px bg-gray-200 w-[94%] mx-auto"></div>
      </div>
    </header>
  );
};

export default Header; 