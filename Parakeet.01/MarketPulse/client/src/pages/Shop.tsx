import { useState, useEffect, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import CategoryNav from "@/components/CategoryNav";
import AIChatAssistant from "@/components/AIChatAssistant";
import { ProductCard } from "@/components/ProductCard";
import { CourseCard } from "@/components/CourseCard";
import { ServiceCard } from "@/components/ServiceCard";
import { LanguageContext } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";

const Shop = () => {
  const [location] = useLocation();
  const [, params] = useRoute("/shop/product/:id");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [productType, setProductType] = useState<string | undefined>();
  const [, navigate] = useLocation();
  const { language } = useContext(LanguageContext);
  const t = translations[language];

  // Parse query parameters from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");
    const search = urlParams.get("search");
    const type = urlParams.get("type");
    const featured = urlParams.get("featured");
    const section = urlParams.get("section");

    if (category) {
      setSelectedCategoryId(parseInt(category));
    }

    if (search) {
      setSearchQuery(search);
    }

    if (type) {
      setProductType(type);
    } else if (featured) {
      // If featured=true, we'll fetch featured products
      setProductType("featured");
    } else if (section) {
      // Handle sections from AI assistant
      if (section === "featured") {
        setProductType("featured");
      } else if (section === "services") {
        setProductType("service");
      } else if (section === "courses") {
        setProductType("course");
      }
    }
  }, [location]);

  // Fetch products based on query parameters
  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError
  } = useQuery({
    queryKey: searchQuery 
      ? ['/api/products/search', searchQuery] 
      : productType === "featured" 
        ? ['/api/products/featured'] 
        : productType === "service" && !selectedCategoryId 
          ? ['/api/services/popular'] 
          : productType === "course" && !selectedCategoryId 
            ? ['/api/courses/trending'] 
            : selectedCategoryId 
              ? [`/api/categories/${selectedCategoryId}/products`] 
              : ['/api/products'],
    queryFn: async ({ queryKey }) => {
      let url = queryKey[0] as string;
      if (queryKey[0] === '/api/products/search' && queryKey[1]) {
        url = `${url}?q=${encodeURIComponent(queryKey[1] as string)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });

  // Handle category selection
  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    // Update URL
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

  // Handle product details view
  const handleViewProduct = (productId: number) => {
    navigate(`/shop/product/${productId}`);
  };

  // Get page title based on filters
  const getPageTitle = () => {
    if (searchQuery) {
      return `${t.search}: ${searchQuery}`;
    } else if (productType === "featured") {
      return t.featuredProducts;
    } else if (productType === "service") {
      return t.popularServices;
    } else if (productType === "course") {
      return t.trendingCourses;
    } else {
      return t.search;
    }
  };

  // Since we have a Route in App.tsx for product detail, we don't need this condition anymore
  // The routing will be handled by the router defined in App.tsx

  return (
    <>
      <Header showBack title={getPageTitle()} />

      <main className="flex-1 overflow-y-auto pb-16">
        {/* Search Bar */}
        <section className="px-4 pt-4 pb-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder={t.searchProducts}
                className="w-full rounded-lg px-4 py-2.5 pr-10 bg-white border border-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        </section>

        {/* Category Navigation */}
        <CategoryNav
          onSelectCategory={handleCategorySelect}
          selectedCategoryId={selectedCategoryId}
        />

        {/* Products Grid */}
        <section className="px-4 mb-6">
          {productsLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-2 gap-3">
              {Array(6).fill(0).map((_, i) => (
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
              ))}
            </div>
          ) : productsError ? (
            // Error state
            <div className="py-8 text-center">
              <i className="ri-error-warning-line text-3xl text-error mb-2"></i>
              <p className="text-gray-500">Error loading products. Please try again.</p>
            </div>
          ) : products?.length === 0 ? (
            // Empty state
            <div className="py-8 text-center">
              <i className="ri-shopping-bag-line text-3xl text-gray-400 mb-2"></i>
              <p className="text-gray-500">No products found.</p>
            </div>
          ) : (
            // Product grid
            <>
              {/* If we have courses */}
              {products && products[0]?.type === "course" && products[0]?.course ? (
                <div className="space-y-3">
                  {products.map((course: any) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onViewDetails={handleViewProduct}
                    />
                  ))}
                </div>
              ) : (
                // Regular product grid for other types
                <div className="grid grid-cols-2 gap-3">
                  {products?.map((product: any) => (
                    product.type === "service" ? (
                      <ServiceCard
                        key={product.id}
                        service={product}
                        onViewDetails={handleViewProduct}
                      />
                    ) : (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onViewDetails={handleViewProduct}
                      />
                    )
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <AIChatAssistant />
      <BottomNavigation />
    </>
  );
};

export default Shop;
