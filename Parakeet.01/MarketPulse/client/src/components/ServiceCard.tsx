import { useContext } from "react";
import { LanguageContext } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

interface ServiceCardProps {
  service: Product;
  onViewDetails: (serviceId: number) => void;
}

export const ServiceCard = ({ service, onViewDetails }: ServiceCardProps) => {
  const { language } = useContext(LanguageContext);
  const { toast } = useToast();
  const t = translations[language];

  const handleInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Show toast notification
    toast({
      title: t.inquirySent,
      description: t.inquiryConfirmation,
      duration: 3000,
    });
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => onViewDetails(service.id)}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img 
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm mb-1 line-clamp-2">{service.name}</h3>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <i className="ri-star-fill text-warning mr-1"></i>
          <span>{(service.rating / 10).toFixed(1)}</span>
          <span className="mx-1">•</span>
          <span>{service.sales}+ {t.clients}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{formatPrice(service.price)}</span>
          <button 
            className="text-xs bg-primary text-white px-2 py-1 rounded-md"
            onClick={handleInquiry}
          >
            {t.inquire}
          </button>
        </div>
      </div>
    </div>
  );
};
