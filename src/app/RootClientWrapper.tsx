'use client';

import React from 'react';
import { NavigationLoaderProvider } from '../components/ui/NavigationLoader';

export default function RootClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <NavigationLoaderProvider>
      {children}
    </NavigationLoaderProvider>
  );
} 