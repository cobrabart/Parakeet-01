import { useState, useContext, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { formatPrice, cn } from '@/lib/utils';
import { CartContext } from '@/contexts/CartContext';
import { LanguageContext } from '@/contexts/LanguageContext';
import { translations } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Clock, 
  Calendar, 
  Check, 
  Star, 
  ThumbsUp,
  Users,
  Wallet,
  MessageSquare,
  ShoppingCart
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useContext(CartContext);
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${id}`],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0] as string);
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      return response.json();
    }
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast({
        title: t.added,
        description: t.addedToCart,
      });
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      navigate('/cart');
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header showBack title={t.loading} />
        <main className="flex-1 overflow-y-auto pb-16 px-4">
          <div className="animate-pulse">
            <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="mt-6 space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <BottomNavigation />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header showBack title={t.error} />
        <main className="flex-1 overflow-y-auto pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">{t.notFound}</h2>
            <p className="text-gray-500 mb-4">{t.productNotFound}</p>
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg"
              onClick={() => navigate('/')}
            >
              {t.backToHome}
            </button>
          </div>
        </main>
        <BottomNavigation />
      </>
    );
  }

  // Format type specific details
  const productType = product.type || 'product';
  const isCourse = productType === 'course';

  return (
    <>
      <Header showBack title={product.name} />
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Product Image Carousel */}
        <div className="w-full aspect-[4/3] relative">
          <img
            src={product.imageUrl || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button 
              onClick={async () => {
                try {
                  const response = await fetch(`/api/products/${id}/save`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  });
                  if (response.ok) {
                    toast({
                      title: t.success,
                      description: t.productSaved,
                    });
                  }
                } catch (error) {
                  toast({
                    title: t.error,
                    description: t.errorSavingProduct,
                    variant: "destructive"
                  });
                }
              }}
              className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <div className="bg-white rounded-full p-2 shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center text-white">
              <div className="mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <span className="text-sm font-medium">{product.rating || 5}/5</span>
              <span className="mx-2">•</span>
              <span className="text-sm">{product.sales || 0}+ {t.sold}</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h1 className="text-xl font-bold mb-1">{product.name}</h1>
          <div className="flex items-center space-x-1 mb-3">
            <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-500 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>

          {/* Category */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {productType.charAt(0).toUpperCase() + productType.slice(1)}
            </span>
          </div>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="details" className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">{t.details}</TabsTrigger>
              <TabsTrigger value="timeline">{t.timeline}</TabsTrigger>
              <TabsTrigger value="reviews">{t.reviews}</TabsTrigger>
              <TabsTrigger value="gallery">{t.gallery}</TabsTrigger>
              <TabsTrigger value="payment">{t.payment}</TabsTrigger>
            </TabsList>

            {/* Product Details Tab */}
            <TabsContent value="details" className="pt-4">
              {/* Purpose Section */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <ThumbsUp size={18} className="mr-2 text-primary" />
                  <h3 className="font-semibold">{t.purpose}</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm">
                    {product.details?.purpose || 
                      (productType === 'service' && t.purposeAIChatbot) || 
                      t.purposeGeneric}
                  </p>
                </div>
              </div>

              {/* Features/What's Included */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <Check size={18} className="mr-2 text-primary" />
                  <h3 className="font-semibold">{t.features}</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-2">
                    {product.details?.features ? (
                      Array.isArray(product.details.features) ? 
                        product.details.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check size={16} className="mr-2 text-green-500 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))
                      : 
                        // Generate dynamic features based on product type if not provided
                        (productType === 'service' ? [
                          t.feature1AIChatbot,
                          t.feature2AIChatbot,
                          t.feature3AIChatbot,
                          t.feature4AIChatbot
                        ] : [
                          t.feature1Generic,
                          t.feature2Generic,
                          t.feature3Generic,
                          t.feature4Generic
                        ]).map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <Check size={16} className="mr-2 text-green-500 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))
                    ) : (
                      // Fallback if no features available
                      (productType === 'service' ? [
                        t.feature1AIChatbot,
                        t.feature2AIChatbot,
                        t.feature3AIChatbot,
                        t.feature4AIChatbot
                      ] : [
                        t.feature1Generic,
                        t.feature2Generic,
                        t.feature3Generic,
                        t.feature4Generic
                      ]).map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check size={16} className="mr-2 text-green-500 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* Full Description */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <MessageSquare size={18} className="mr-2 text-primary" />
                  <h3 className="font-semibold">{t.fullDescription}</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 text-sm whitespace-pre-line">
                    {product.details?.fullDescription || product.description}
                  </p>
                </div>
              </div>

              {/* Service-specific information for services */}
              {productType === 'service' && (
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <Users size={18} className="mr-2 text-primary" />
                    <h3 className="font-semibold">{t.teamInfo}</h3>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm">
                      {product.details?.teamInfo || t.teamInfoGeneric}
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="pt-4">
              <div className="relative pl-8 mb-8">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"></div>

                {product.details?.timeline ? (
                  Array.isArray(product.details.timeline) ? 
                    product.details.timeline.map((step, idx) => (
                      <div key={idx} className="mb-6 relative">
                        <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                        <div className="mb-1">
                          <h4 className="font-semibold text-primary">{step.title || `${t.phase} ${idx + 1}`}</h4>
                          <p className="text-xs text-gray-500">{step.duration || t.timeEstimate}</p>
                        </div>
                        <p className="text-sm text-gray-700">{step.description}</p>
                      </div>
                    ))
                  : 
                    // Generate dynamic timeline based on product type
                    (productType === 'service' ? [
                      { title: t.phase1Title, duration: t.phase1Time, description: t.phase1Desc },
                      { title: t.phase2Title, duration: t.phase2Time, description: t.phase2Desc },
                      { title: t.phase3Title, duration: t.phase3Time, description: t.phase3Desc },
                      { title: t.phase4Title, duration: t.phase4Time, description: t.phase4Desc }
                    ] : [
                      { title: t.phaseG1Title, duration: t.phaseG1Time, description: t.phaseG1Desc },
                      { title: t.phaseG2Title, duration: t.phaseG2Time, description: t.phaseG2Desc },
                      { title: t.phaseG3Title, duration: t.phaseG3Time, description: t.phaseG3Desc }
                    ]).map((step, idx) => (
                      <div key={idx} className="mb-6 relative">
                        <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                        <div className="mb-1">
                          <h4 className="font-semibold text-primary">{step.title}</h4>
                          <p className="text-xs text-gray-500">{step.duration}</p>
                        </div>
                        <p className="text-sm text-gray-700">{step.description}</p>
                      </div>
                    ))
                ) : (
                  // Fallback if no timeline available
                  (productType === 'service' ? [
                    { title: t.phase1Title, duration: t.phase1Time, description: t.phase1Desc },
                    { title: t.phase2Title, duration: t.phase2Time, description: t.phase2Desc },
                    { title: t.phase3Title, duration: t.phase3Time, description: t.phase3Desc },
                    { title: t.phase4Title, duration: t.phase4Time, description: t.phase4Desc }
                  ] : [
                    { title: t.phaseG1Title, duration: t.phaseG1Time, description: t.phaseG1Desc },
                    { title: t.phaseG2Title, duration: t.phaseG2Time, description: t.phaseG2Desc },
                    { title: t.phaseG3Title, duration: t.phaseG3Time, description: t.phaseG3Desc }
                  ]).map((step, idx) => (
                    <div key={idx} className="mb-6 relative">
                      <div className="absolute left-[-8px] w-4 h-4 rounded-full bg-primary"></div>
                      <div className="mb-1">
                        <h4 className="font-semibold text-primary">{step.title}</h4>
                        <p className="text-xs text-gray-500">{step.duration}</p>
                      </div>
                      <p className="text-sm text-gray-700">{step.description}</p>
                    </div>
                  ))
                )}

                <div className="mt-4">
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 text-primary" />
                    <h3 className="font-semibold">{t.estimatedTime}</h3>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {product.details?.estimatedTime || 
                     (productType === 'service' ? t.estimatedTimeService : t.estimatedTimeProduct)}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="pt-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold flex items-center">
                    <Star size={18} className="mr-2 text-yellow-500" />
                    {t.customerReviews}
                  </h3>
                  <div className="text-sm text-primary font-medium">{t.writeReview}</div>
                </div>

                <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
                  <div className="text-3xl font-bold mr-3 text-primary">{product.rating || "4.8"}</div>
                  <div>
                    <div className="flex text-yellow-500 mb-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={16} fill={(product.rating || 4.8) >= star ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {t.basedOn} {product.details?.reviewCount || product.sales || 48} {t.reviews.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Reviews list */}
                <div className="space-y-4">
                  {product.details?.reviews ? (
                    Array.isArray(product.details.reviews) ?
                      product.details.reviews.map((review, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-4">
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">{review.userName}</div>
                            <div className="text-xs text-gray-500">{review.date}</div>
                          </div>
                          <div className="flex text-yellow-500 mb-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={12} fill={review.rating >= star ? "currentColor" : "none"} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    :
                      // Generate sample reviews if real ones aren't available
                      [
                        { userName: "Alex K.", date: "2025-02-15", rating: 5, comment: t.review1Text },
                        { userName: "Sarah M.", date: "2025-02-05", rating: 4, comment: t.review2Text },
                        { userName: "David L.", date: "2025-01-28", rating: 5, comment: t.review3Text }
                      ].map((review, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-4">
                          <div className="flex justify-between mb-1">
                            <div className="font-medium">{review.userName}</div>
                            <div className="text-xs text-gray-500">{review.date}</div>
                          </div>
                          <div className="flex text-yellow-500 mb-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={12} fill={review.rating >= star ? "currentColor" : "none"} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        </div>
                      ))
                  ) : (
                    // Fallback sample reviews
                    [
                      { userName: "Alex K.", date: "2025-02-15", rating: 5, comment: t.review1Text },
                      { userName: "Sarah M.", date: "2025-02-05", rating: 4, comment: t.review2Text },
                      { userName: "David L.", date: "2025-01-28", rating: 5, comment: t.review3Text }
                    ].map((review, idx) => (
                      <div key={idx} className="border-b border-gray-100 pb-4">
                        <div className="flex justify-between mb-1">
                          <div className="font-medium">{review.userName}</div>
                          <div className="text-xs text-gray-500">{review.date}</div>
                        </div>
                        <div className="flex text-yellow-500 mb-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={12} fill={review.rating >= star ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add review form */}
                <button className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                  {t.seeAllReviews}
                </button>
              </div>
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="pt-4">
              <div className="grid grid-cols-2 gap-2">
                {product.details?.gallery ? (
                  Array.isArray(product.details.gallery) ?
                    product.details.gallery.map((image, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                        <img src={image.url || image} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  :
                    // Generate sample gallery
                    [product.imageUrl || '/placeholder-product.jpg', 
                     '/placeholder-result.jpg', 
                     '/placeholder-process.jpg', 
                     '/placeholder-example.jpg'].map((image, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                        <img src={image} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                ) : (
                  // Fallback gallery
                  [product.imageUrl || '/placeholder-product.jpg', 
                   '/placeholder-result.jpg', 
                   '/placeholder-process.jpg', 
                   '/placeholder-example.jpg'].map((image, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                      <img src={image} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                )}
              </div>

              {/* Results section */}
              <div className="mt-6">
                <div className="flex items-center mb-2">
                  <ThumbsUp size={18} className="mr-2 text-primary" />
                  <h3 className="font-semibold">{t.results}</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-3">
                    {product.details?.results || 
                     (productType === 'service' ? t.resultsServiceText : t.resultsProductText)}
                  </p>

                  {/* Before/After comparison if available */}
                  {product.details?.beforeAfter && (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-medium text-gray-700">{t.beforeAfter}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">{t.before}</div>
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                            <img src={product.details.beforeAfter.before || '/placeholder-before.jpg'} 
                                 alt="Before" className="w-full h-full object-cover" />
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">{t.after}</div>
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                            <img src={product.details.beforeAfter.after || '/placeholder-after.jpg'} 
                                 alt="After" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="pt-4">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <CreditCard size={18} className="mr-2 text-primary" />
                  <h3 className="font-semibold">{t.paymentOptions}</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <i className="ri-visa-line text-blue-600 text-xl"></i>
                    </div>
                    <span className="text-sm">Visa</span>
                  </div>
                  <div className="p-3 border rounded-lg flex flex-col items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-2">
                      <i className="ri-mastercard-line text-red-600 text-xl"></i>
                    </div>
                    <span className="text-sm">MasterCard</span>
                  </div>
                  <div className="p-3 border rounded-lg flex flex-col items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                      <i className="ri-bank-card-line text-purple-600 text-xl"></i>
                    </div>
                    <span className="text-sm">Humo</span>
                  </div>
                  <div className="p-3 border rounded-lg flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <i className="ri-bank-card-line text-green-600 text-xl"></i>
                    </div>
                    <span className="text-sm">UzCard</span>
                  </div>
                  <div className="p-3 border rounded-lg flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <i className="ri-coin-line text-blue-600 text-xl"></i>
                    </div>
                    <span className="text-sm">USDT</span>
                  </div>
                  <div className="p-3 border rounded-lg flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <Wallet size={20} className="text-green-600" />
                    </div>
                    <span className="text-sm">{t.wallet}</span>
                  </div>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-primary"
                  >
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <h3 className="font-semibold">{t.pricingBreakdown}</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-2 divide-y divide-gray-200">
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-gray-600">{t.basePrice}</span>
                      <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-gray-600">{t.quantity}</span>
                      <span className="text-sm font-medium">× {quantity}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-sm text-gray-600">{t.subtotal}</span>
                      <span className="text-sm font-medium">{formatPrice(product.price * quantity)}</span>
                    </div>
                    <div className="flex justify-between py-1 pt-2">
                      <span className="text-sm font-medium">{t.total}</span>
                      <span className="text-sm font-bold text-primary">{formatPrice(product.price * quantity)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Refund policy */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-primary"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <h3 className="font-semibold">{t.refundPolicy}</h3>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{t.refundPolicyText}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Quantity selector */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">{t.quantity}</h3>
            <div className="flex items-center">
              <button
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                onClick={decrementQuantity}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center"
                onClick={incrementQuantity}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex items-center space-x-3">
        <button
          className="flex-1 py-2 border border-primary text-primary font-medium rounded-lg"
          onClick={handleAddToCart}
        >
          {t.addToCart}
        </button>
        <button
          className="flex-1 py-2 bg-primary text-white font-medium rounded-lg"
          onClick={handleBuyNow}
        >
          {t.buyNow}
        </button>
      </div>
      <BottomNavigation />
    </>
  );
};

export default ProductDetail;