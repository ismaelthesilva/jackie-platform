'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Import JSON files directly
import enTranslations from '@/locales/en.json';
import brTranslations from '@/locales/br.json';

export interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  const translations = {
    en: enTranslations,
    br: brTranslations
  };

  const t = (key: string, fallback?: string): string => {
    try {
      const keys = key.split('.');
      let value: unknown = translations[language as keyof typeof translations];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return fallback || key;
        }
      }
      
      return typeof value === 'string' ? value : fallback || key;
    } catch (error) {
      console.error('Translation error:', error);
      return fallback || key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
