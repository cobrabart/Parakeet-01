import { useContext } from "react";
import { LanguageSelector } from "./LanguageSelector";
import { LanguageContext } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { translations } from "@/lib/i18n";

interface HeaderProps {
  showBack?: boolean;
  title?: string;
}

export const Header = ({ showBack = false, title }: HeaderProps) => {
  const [location, navigate] = useLocation();
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center">
        {showBack && (
          <button 
            className="mr-2 text-gray-700" 
            onClick={() => navigate("/")}
            aria-label="Go back"
          >
            <i className="ri-arrow-left-s-line text-xl"></i>
          </button>
        )}
        {!showBack && (
          <img src="https://kokonutui.com/logo.svg" alt="Parakeet by ApexBart" className="h-8" />
        )}
        <div className="ml-2">
          <h1 className="font-bold text-lg text-primary">
            {title || "Parakeet"}
          </h1>
          <span className="text-xs text-gray-500">by ApexBart Solutions</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSelector />
        <button className="p-2 text-gray-600 hover:text-primary">
          <i className="ri-notification-3-line text-xl"></i>
        </button>
        <button className="p-2 text-gray-600 hover:text-primary" onClick={() => navigate("/profile")}>
          <i className="ri-user-3-line text-xl"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
