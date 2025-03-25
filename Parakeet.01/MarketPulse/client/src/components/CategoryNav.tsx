import { useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LanguageContext } from "@/contexts/LanguageContext";
import { CategoryItem } from "@shared/types";

interface CategoryNavProps {
  onSelectCategory: (categoryId: number) => void;
  selectedCategoryId?: number;
}

export const CategoryNav = ({ onSelectCategory, selectedCategoryId }: CategoryNavProps) => {
  const { language } = useContext(LanguageContext);
  
  // Fetch categories from the API
  const { data: apiCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Map API categories to CategoryItem with translations
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  
  useEffect(() => {
    if (apiCategories) {
      const mappedCategories: CategoryItem[] = apiCategories.map((cat: any) => ({
        id: cat.id,
        name: {
          en: cat.name,
          ru: getCategoryNameRu(cat.slug),
          uz: getCategoryNameUz(cat.slug)
        },
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color || '#2B5AEC'
      }));
      setCategories(mappedCategories);
    }
  }, [apiCategories]);

  // Helper function to get Russian category name
  const getCategoryNameRu = (slug: string): string => {
    switch (slug) {
      case 'ai-services': return 'ИИ сервисы';
      case 'copywriting': return 'Копирайтинг';
      case 'tools': return 'Инструменты';
      case 'courses': return 'Курсы';
      case 'analytics': return 'Аналитика';
      default: return '';
    }
  };

  // Helper function to get Uzbek category name
  const getCategoryNameUz = (slug: string): string => {
    switch (slug) {
      case 'ai-services': return 'AI xizmatlar';
      case 'copywriting': return 'Kontent yozish';
      case 'tools': return 'Qurollar';
      case 'courses': return 'Kurslar';
      case 'analytics': return 'Tahlillar';
      default: return '';
    }
  };
  
  return (
    <section className="px-4 mb-5">
      <div className="flex overflow-x-auto gap-3 py-2 no-scrollbar">
        {categoriesLoading ? (
          // Show loading skeleton
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center min-w-[75px] p-2 bg-gray-100 rounded-lg animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 mb-1"></div>
              <div className="h-3 w-14 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          // Show categories
          categories.map((category) => (
            <button
              key={category.id}
              className={`flex items-center gap-2 px-3 py-1.5 min-w-[auto] bg-white/80 backdrop-blur-sm rounded-full border ${
                selectedCategoryId === category.id
                  ? 'border-primary/50 bg-primary/5 shadow-sm'
                  : 'border-gray-100 hover:border-primary/30 hover:bg-gray-50/50'
              } focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-200 group`}
              onClick={() => onSelectCategory(category.id)}
            >
              <div 
                className="w-6 h-6 flex items-center justify-center rounded-full transition-colors" 
                style={{ 
                  color: category.color 
                }}
              >
                <i className={`${category.icon} text-sm group-hover:scale-110 transition-transform duration-200`}></i>
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{category.name[language]}</span>
            </button>
          ))
        )}
      </div>
    </section>
  );
};

export default CategoryNav;
