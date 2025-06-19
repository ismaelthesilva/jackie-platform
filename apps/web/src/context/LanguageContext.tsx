import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translation files
import enTranslations from '@/locales/en.json';
import brTranslations from '@/locales/br.json'; // Use br.json

// Define the shape of our context
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
}

// Define the translations type
type Translations = {
  [key: string]: any;
};

// Available translations - change 'pt' to 'br'
const translations: { [key: string]: Translations } = {
  en: enTranslations,
  br: brTranslations, // Changed from pt: ptTranslations
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string, fallback?: string): string => {
    try {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Key not found, return fallback or key
          console.warn(`Translation key not found: ${key} for language: ${language}`);
          return fallback || key;
        }
      }
      
      // Return the found value or fallback
      return typeof value === 'string' ? value : (fallback || key);
    } catch (error) {
      console.error('Translation error for key:', key, error);
      return fallback || key;
    }
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;