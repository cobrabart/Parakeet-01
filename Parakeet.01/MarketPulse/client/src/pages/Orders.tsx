import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { LanguageContext } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { useLocation } from "wouter";

const Orders = () => {
  const { language } = useContext(LanguageContext);
  const [, navigate] = useLocation();
  const t = translations[language];

  // Fetch orders
  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['/api/orders'],
  });

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

  return (
    <>
      <Header showBack title={t.orders} />
      
      <main className="flex-1 overflow-y-auto pb-16 px-4">
        {isLoading ? (
          // Loading skeleton
          <div className="py-4 space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          // Error state
          <div className="py-8 text-center">
            <i className="ri-error-warning-line text-3xl text-error mb-2"></i>
            <p className="text-gray-500">{t.errorLoadingOrders}</p>
          </div>
        ) : orders?.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <i className="ri-file-list-3-line text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t.noOrders}</h3>
            <p className="text-sm text-gray-500 mb-6">{t.startShoppingMessage}</p>
            <button 
              className="px-4 py-2 bg-primary text-white rounded-lg shadow-sm"
              onClick={() => navigate("/")}
            >
              {t.startShopping}
            </button>
          </div>
        ) : (
          // Orders list
          <div className="py-4 space-y-3">
            {orders.map((order: any) => {
              const status = getStatusLabel(order.status);
              
              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">#{order.id.toString().padStart(4, '0')}</div>
                    <div className="text-xs text-gray-500">{formatOrderDate(order.orderDate)}</div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.className}`}>
                      {status.text}
                    </span>
                    <span className="font-bold">{formatPrice(order.totalAmount)}</span>
                  </div>
                  
                  {/* View details button */}
                  <div className="flex justify-end">
                    <button className="text-xs text-primary flex items-center">
                      {t.viewDetails} <i className="ri-arrow-right-s-line ml-1"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </>
  );
};

export default Orders;
