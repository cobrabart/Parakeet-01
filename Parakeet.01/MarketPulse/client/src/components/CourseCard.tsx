import { useContext } from "react";
import { useLocation } from "wouter";
import { LanguageContext } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { CourseWithDetails } from "@shared/types";

interface CourseCardProps {
  course: CourseWithDetails; // Course with product details
  onViewDetails?: (courseId: number) => void;
}

export const CourseCard = ({ course, onViewDetails }: CourseCardProps) => {
  const { language } = useContext(LanguageContext);
  const [, navigate] = useLocation();
  const t = translations[language];

  // Format duration in hours
  const formatDuration = (minutes: number = 0) => {
    const hours = Math.floor(minutes / 60);
    return `${hours} ${hours === 1 ? t.hour : t.hours}`;
  };

  // Safe access to nested properties
  const modules = course?.courseDetails?.modules || 0;
  const duration = course?.courseDetails?.duration || 0;

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(course.id);
    } else {
      navigate(`/shop/product/${course.id}`);
    }
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="w-1/3 relative">
        <img 
          src={course.imageUrl || "/placeholder-course.jpg"}
          alt={course.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="w-2/3 p-3">
        <div className="flex items-center text-xs mb-1">
          <span className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">{t.course}</span>
        </div>
        <h3 className="font-medium text-sm mb-1 line-clamp-1">{course.name}</h3>
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <span>{modules} {t.modules}</span>
          <span className="mx-1">•</span>
          <i className="ri-time-line mr-1"></i>
          <span>{formatDuration(duration)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{formatPrice(course.price)}</span>
          <button 
            className="text-xs bg-primary text-white px-2 py-1 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetails) {
                onViewDetails(course.id);
              } else {
                navigate(`/shop/product/${course.id}`);
              }
            }}
          >
            {t.details}
          </button>
        </div>
      </div>
    </div>
  );
};
