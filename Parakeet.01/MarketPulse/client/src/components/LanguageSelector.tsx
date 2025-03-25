import { useContext, useState, useRef, useEffect } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";

export const LanguageSelector = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get language label
  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "en": return "EN";
      case "ru": return "RU";
      case "uz": return "UZ";
      default: return "EN";
    }
  };

  // Get language name
  const getLanguageName = (lang: string) => {
    switch (lang) {
      case "en": return "English";
      case "ru": return "Русский";
      case "uz": return "O'zbek";
      default: return "English";
    }
  };

  // Handle language selection
  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center text-sm font-medium text-gray-700 hover:text-primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <span>{getLanguageLabel(language)}</span>
        <i className={`ri-arrow-down-s-line ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="py-1">
            {["en", "ru", "uz"].map((lang) => (
              <button
                key={lang}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  language === lang ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleLanguageSelect(lang)}
              >
                {getLanguageName(lang)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
