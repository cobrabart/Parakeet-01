import { useContext } from "react";
import { useLocation } from "wouter";
import { LanguageContext } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  onViewDetails?: (productId: number) => void;
}

export const ProductCard = ({ product, compact = false, onViewDetails }: ProductCardProps) => {
  const { language } = useContext(LanguageContext);
  const { addItem } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const t = translations[language];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast({
      title: t.added || "Added to cart",
      description: t.addedToCart || `${product.name} has been added to your cart`,
    });
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(product.id);
    } else {
      navigate(`/shop/product/${product.id}`);
    }
  };

  if (compact) {
    return (
      <div 
        className="flex items-center cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
          <img 
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="font-medium text-sm">{product.name}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold">{formatPrice(product.price)}</span>
            <button 
              className="text-xs bg-primary text-white px-2 py-1 rounded-md"
              onClick={handleAddToCart}
            >
              {t.add}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img 
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {product.popular && (
          <span className="absolute top-2 left-2 bg-primary text-white text-xs py-1 px-2 rounded-full">
            {t.popular}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <i className="ri-star-fill text-warning mr-1"></i>
          <span>{(product.rating / 10).toFixed(1)}</span>
          <span className="mx-1">•</span>
          <span>{product.sales}+ {t.sold}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{formatPrice(product.price)}</span>
          <button 
            className="text-xs bg-primary text-white px-2 py-1 rounded-md"
            onClick={handleAddToCart}
          >
            {t.add}
          </button>
        </div>
      </div>
    </div>
  );
};
