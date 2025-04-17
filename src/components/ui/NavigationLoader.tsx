'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import PageLoader from './PageLoader';

// Create context for navigation state
interface NavigationContextProps {
  isNavigating: boolean;
  startNavigation: (href: string) => void;
}

const NavigationContext = createContext<NavigationContextProps>({
  isNavigating: false,
  startNavigation: () => {}
});

// Hook to use the navigation context
export const useNavigation = () => useContext(NavigationContext);

// Provider component
export const NavigationLoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Reset navigation state when path changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);
  
  // Function to start navigation with loader
  const startNavigation = useCallback((href: string) => {
    setIsNavigating(true);
    
    // Short delay to show the animation
    setTimeout(() => {
      router.push(href);
    }, 600); // Adjust timing as needed
  }, [router]);
  
  return (
    <NavigationContext.Provider value={{ isNavigating, startNavigation }}>
      <PageLoader isLoading={isNavigating} />
      {children}
    </NavigationContext.Provider>
  );
};

// Navigation link component with loader
interface NavigationLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({ 
  href, 
  className = '', 
  children 
}) => {
  const { startNavigation } = useNavigation();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    startNavigation(href);
  };
  
  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

// Navigation button component with loader
interface NavigationButtonProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({ 
  href, 
  className = '', 
  children 
}) => {
  const { startNavigation } = useNavigation();
  
  const handleClick = () => {
    startNavigation(href);
  };
  
  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}; 