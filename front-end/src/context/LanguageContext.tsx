import { LanguageContextType } from '@/types/types';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

const defaultContextValue: LanguageContextType = {
  language: null,
  changeLanguage: () => {}
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<string | null>(null);
  
  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("locale", lang); 
  };
  
  useEffect(() => {
    const storedLanguage = localStorage.getItem("locale");
    if (storedLanguage) {
      setLanguage(storedLanguage);
    } else {
      setLanguage("en");
    }
  }, []);
  
  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
