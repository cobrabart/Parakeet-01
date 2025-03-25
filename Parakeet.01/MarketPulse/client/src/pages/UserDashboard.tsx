import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { LanguageContext } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";

const UserDashboard = () => {
  const { language } = useContext(LanguageContext);
  const [, navigate] = useLocation();
  const t = translations[language];

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user'],
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/user/dashboard-stats'],
  });

  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  // Fetch saved products
  const { data: savedProducts, isLoading: savedLoading } = useQuery({
    queryKey: ['/api/saved-products'],
  });

  // Handle removing saved item
  const handleRemoveSaved = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    // This would call an API to remove the item
    console.log(`Remove saved item ${productId}`);
  };

  // Format order date based on language
  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, t.dateFormat);
  };

  // Get status label based on order status and language
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: language === 'en' ? 'Pending' : language === 'ru' ? 'В ожидании' : 'Kutilmoqda',
          className: 'bg-yellow-100 text-yellow-700'
        };
      case 'processing':
        return {
          text: language === 'en' ? 'Processing' : language === 'ru' ? 'В обработке' : 'Ishlanmoqda',
          className: 'bg-blue-100 text-blue-700'
        };
      case 'completed':
        return {
          text: language === 'en' ? 'Completed' : language === 'ru' ? 'Завершен' : 'Bajarilgan',
          className: 'bg-green-100 text-green-700'
        };
      case 'cancelled':
        return {
          text: language === 'en' ? 'Cancelled' : language === 'ru' ? 'Отменен' : 'Bekor qilindi',
          className: 'bg-red-100 text-red-700'
        };
      case 'in_progress':
        return {
          text: language === 'en' ? 'In Progress' : language === 'ru' ? 'В процессе' : 'Jarayonda',
          className: 'bg-yellow-100 text-yellow-700'
        };
      default:
        return {
          text: status,
          className: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const isLoading = userLoading || statsLoading || ordersLoading || savedLoading;

  return (
    <>
      <Header showBack title={t.myDashboard} />
      
      <main className="flex-1 overflow-y-auto pb-16 px-4">
        {isLoading ? (
          // Loading skeleton
          <div className="py-4 space-y-5">
            {/* User Info Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                <div className="ml-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-3 gap-3 animate-pulse">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
            
            {/* Recent Purchases Skeleton */}
            <div className="animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
              <div className="space-y-3">
                {Array(2).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 flex">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div className="ml-3 flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-5">
            {/* User Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                <i className="ri-user-3-line text-2xl"></i>
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">{user?.fullName || user?.username}</h3>
                <p className="text-sm text-gray-500">{user?.email || ""}</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <div className="text-xl font-bold text-primary">{stats?.orders || 0}</div>
                <div className="text-xs text-gray-500">{t.orders}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <div className="text-xl font-bold text-secondary">{stats?.saved || 0}</div>
                <div className="text-xs text-gray-500">{t.saved}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <div className="text-xl font-bold text-success">{stats?.completed || 0}</div>
                <div className="text-xs text-gray-500">{t.completed}</div>
              </div>
            </div>
            
            {/* Recent Purchases */}
            {orders && orders.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-3">{t.recentPurchases}</h2>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order: any) => {
                    const status = getStatusLabel(order.status);
                    return (
                      <div 
                        key={order.id} 
                        className="bg-white rounded-lg border border-gray-200 p-3 flex items-center cursor-pointer"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden shrink-0">
                          {/* This would show the first product image, or a default icon */}
                          <i className="ri-shopping-bag-line text-xl flex items-center justify-center h-full text-gray-400"></i>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="font-medium text-sm">Order #{order.id.toString().padStart(4, '0')}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">{formatOrderDate(order.orderDate)}</span>
                            <span className="text-xs font-semibold">{formatPrice(order.totalAmount)}</span>
                          </div>
                          <div className="mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${status.className}`}>
                              {status.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Saved Products */}
            {savedProducts && savedProducts.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-3">{t.savedProducts}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {savedProducts.map((item: any) => (
                    <div 
                      key={item.id} 
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer"
                      onClick={() => navigate(`/shop/product/${item.product.id}`)}
                    >
                      <div className="aspect-[4/3] relative overflow-hidden">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-red-500"
                          onClick={(e) => handleRemoveSaved(e, item.product.id)}
                        >
                          <i className="ri-heart-fill"></i>
                        </button>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-1">{item.product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm">{formatPrice(item.product.price)}</span>
                          <button className="text-xs bg-primary text-white px-2 py-1 rounded-md">
                            {t.view}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </>
  );
};

export default UserDashboard;
