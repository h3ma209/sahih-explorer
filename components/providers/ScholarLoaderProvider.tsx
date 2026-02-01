"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import ScholarLoaderModal from '@/components/ui/ScholarLoaderModal';

interface ScholarLoaderContextType {
  simulateLoading: (callback: () => void) => void;
  isLoading: boolean;
}

const ScholarLoaderContext = createContext<ScholarLoaderContextType | undefined>(undefined);

export function useScholarLoader() {
  const context = useContext(ScholarLoaderContext);
  if (context === undefined) {
    throw new Error('useScholarLoader must be used within a ScholarLoaderProvider');
  }
  return context;
}

interface ScholarLoaderProviderProps {
  children: ReactNode;
}

export function ScholarLoaderProvider({ children }: ScholarLoaderProviderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const simulateLoading = (callback: () => void) => {
    setIsLoading(true);
    setTimeout(() => {
        // We perform the navigation (callback) JUST before hiding the loader 
        // to ensure smooth transition, or hide it then navigate.
        // Let's do navigate then hide to avoid flash of current page if possible,
        // but since it's a client side navigation, it's instant.
        // So wait 500ms, then run callback, then hide loader.
        // Actually, if we navigate, the whole layout might not unmount but the page content will replace.
        // If the provider is in the layout, it persists.
        
        callback();
        
        // Give it a small buffer to ensure the new page starts rendering behind the modal
        // before removing the modal.
        setTimeout(() => {
            setIsLoading(false);
        }, 100); 
    }, 1200);
  };

  return (
    <ScholarLoaderContext.Provider value={{ simulateLoading, isLoading }}>
      {children}
      <ScholarLoaderModal isOpen={isLoading} />
    </ScholarLoaderContext.Provider>
  );
}
