import { createContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Initial language based on browser or Telegram settings, defaulting to English
  const getInitialLanguage = () => {
    // Check if Telegram user language is available
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
      const langCode = window.Telegram.WebApp.initDataUnsafe.user.language_code;
      
      // We only support en, ru, and uz
      if (langCode === 'ru' || langCode === 'uz') {
        return langCode;
      }
      return 'en';
    }
    
    // Check local storage
    const savedLanguage = localStorage.getItem('parakeet-language');
    if (savedLanguage && ['en', 'ru', 'uz'].includes(savedLanguage)) {
      return savedLanguage;
    }
    
    // Fallback to browser language
    const browserLang = navigator.language.substring(0, 2);
    if (browserLang === 'ru' || browserLang === 'uz') {
      return browserLang;
    }
    
    // Default to English
    return 'en';
  };

  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('parakeet-language', lang);
  };

  // Effect to update language when Telegram data becomes available
  useEffect(() => {
    const checkTelegramLanguage = () => {
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
        const langCode = window.Telegram.WebApp.initDataUnsafe.user.language_code;
        
        if ((langCode === 'ru' || langCode === 'uz') && langCode !== language) {
          setLanguage(langCode);
        }
      }
    };
    
    // Check if Telegram data is already available
    checkTelegramLanguage();
    
    // Set up a listener for when Telegram WebApp becomes ready
    const handleTelegramReady = () => {
      checkTelegramLanguage();
    };
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent('viewportChanged', handleTelegramReady);
    }
    
    return () => {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.offEvent('viewportChanged', handleTelegramReady);
      }
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
