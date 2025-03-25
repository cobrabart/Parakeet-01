import { useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import CategoryNav from "@/components/CategoryNav";
import { ProductCard } from "@/components/ProductCard";
import { CourseCard } from "@/components/CourseCard";
import { ServiceCard } from "@/components/ServiceCard";
import { LanguageContext } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";

const Home = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const { language } = useContext(LanguageContext);
  const [, navigate] = useLocation();
  const t = translations[language];

  // Fetch featured products
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery({
    queryKey: ['/api/products/featured'],
  });

  // Fetch trending courses
  const { data: trendingCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['/api/courses/trending'],
  });

  // Fetch popular services
  const { data: popularServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services/popular'],
  });

  // Handle category selection
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    navigate(`/shop?category=${categoryId}`);
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle view product details
  const handleViewProduct = (productId: number) => {
    navigate(`/shop/product/${productId}`);
  };

  return (
    <>
      <Header />

      <main className="flex-1 overflow-y-auto pb-16">
        {/* Hero Section with Search */}
        <section className="px-4 pt-3 pb-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="relative">
              <h2 className="font-semibold text-xl mb-1 text-gray-800">AI-Powered Marketplace</h2>
              <p className="text-sm text-gray-600 mb-3">
                Discover digital products, services & automation tools
              </p>

              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.searchProducts}
                    className="w-full rounded-lg px-4 py-2 pr-10 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/30 transition-all duration-200"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <button 
                    type="submit"
                    className="absolute right-3 top-2.5 text-gray-500"
                    aria-label="Search"
                  >
                    <i className="ri-search-line text-lg"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Category Navigation */}
        <CategoryNav 
          onSelectCategory={handleCategorySelect}
          selectedCategoryId={selectedCategoryId}
        />

        {/* Featured Products */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">{t.featuredProducts}</h2>
            <button 
              className="text-sm text-primary font-medium"
              onClick={() => navigate("/shop?featured=true")}
            >
              {t.viewAll}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featuredLoading ? (
              // Loading skeleton
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredProducts?.map((product: any) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onViewDetails={handleViewProduct}
                />
              ))
            )}
          </div>
        </section>

        {/* Trending Courses */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">{t.trendingCourses}</h2>
            <button 
              className="text-sm text-primary font-medium"
              onClick={() => navigate("/shop?type=course")}
            >
              {t.viewAll}
            </button>
          </div>

          <div className="space-y-3">
            {coursesLoading ? (
              // Loading skeleton
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex animate-pulse">
                  <div className="w-1/3 bg-gray-200"></div>
                  <div className="w-2/3 p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              trendingCourses?.map((course: any) => (
                <CourseCard 
                  key={course.id} 
                  course={course}
                  onViewDetails={(id) => navigate(`/shop/product/${id}`)}
                />
              ))
            )}
          </div>
        </section>

        {/* Popular Services */}
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">{t.popularServices}</h2>
            <button 
              className="text-sm text-primary font-medium"
              onClick={() => navigate("/shop?type=service")}
            >
              {t.viewAll}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {servicesLoading ? (
              // Loading skeleton
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              popularServices?.map((service: any) => (
                <ServiceCard 
                  key={service.id} 
                  service={service}
                  onViewDetails={(id) => navigate(`/shop/product/${id}`)}
                />
              ))
            )}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </>
  );
};

export default Home;