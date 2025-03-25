import { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { LanguageContext } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

const AdminDashboard = () => {
  const { language } = useContext(LanguageContext);
  const t = translations[language];
  const [dateRange, setDateRange] = useState("month"); // "week" or "month"

  // Fetch admin dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard-stats'],
  });

  // Fetch recent orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  // Mock inventory data (in a real app, this would be fetched from an API)
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  // Get growth indicator class
  const getGrowthClass = (value: number) => {
    return value >= 0 ? "text-success" : "text-error";
  };

  // Get growth icon
  const getGrowthIcon = (value: number) => {
    return value >= 0 ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line";
  };

  const isLoading = statsLoading || ordersLoading || productsLoading;

  // Get status label based on order status
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

  // Get inventory status label
  const getInventoryStatus = (product: any) => {
    if (product.available) {
      return {
        text: language === 'en' ? 'Active' : language === 'ru' ? 'Активен' : 'Faol',
        className: 'text-success'
      };
    } else {
      return {
        text: language === 'en' ? 'Inactive' : language === 'ru' ? 'Неактивен' : 'Faol emas',
        className: 'text-error'
      };
    }
  };

  // Get icon based on product type
  const getProductIcon = (type: string) => {
    switch (type) {
      case 'service':
        return 'ri-customer-service-line';
      case 'course':
        return 'ri-book-open-line';
      case 'tool':
        return 'ri-tools-line';
      default:
        return 'ri-shopping-bag-line';
    }
  };

  // Get icon color based on product type
  const getProductIconColor = (type: string) => {
    switch (type) {
      case 'service':
        return 'text-primary';
      case 'course':
        return 'text-purple-500';
      case 'tool':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <>
      <Header showBack title={t.adminDashboard} />
      
      <main className="flex-1 overflow-y-auto pb-16 px-4">
        {isLoading ? (
          // Loading skeleton
          <div className="py-4 space-y-5">
            {/* Date Range Selector Skeleton */}
            <div className="flex justify-between items-center animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 gap-3 animate-pulse">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-6 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
            
            {/* Chart Skeleton */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="flex">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 ml-1"></div>
                </div>
              </div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-5">
            {/* Date Range Selector */}
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">{t.analytics}</h2>
              <button className="flex items-center text-sm text-gray-600 bg-white border border-gray-300 rounded-lg px-3 py-1.5">
                <span>
                  {language === 'en' 
                    ? 'Last 30 Days' 
                    : language === 'ru' 
                      ? 'Последние 30 дней' 
                      : 'So\'nggi 30 kun'}
                </span>
                <i className="ri-arrow-down-s-line ml-1"></i>
              </button>
            </div>
            
            {/* Sales Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500 text-xs mb-1">{t.totalSales}</div>
                <div className="text-2xl font-bold">{stats?.sales}</div>
                <div className={`flex items-center text-xs ${getGrowthClass(stats?.salesGrowth)} mt-1`}>
                  <i className={getGrowthIcon(stats?.salesGrowth)}></i>
                  <span>{Math.abs(stats?.salesGrowth)}% vs {t.lastMonth}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500 text-xs mb-1">{t.orders}</div>
                <div className="text-2xl font-bold">{stats?.orders}</div>
                <div className={`flex items-center text-xs ${getGrowthClass(stats?.ordersGrowth)} mt-1`}>
                  <i className={getGrowthIcon(stats?.ordersGrowth)}></i>
                  <span>{Math.abs(stats?.ordersGrowth)}% vs {t.lastMonth}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500 text-xs mb-1">{t.customers}</div>
                <div className="text-2xl font-bold">{stats?.customers}</div>
                <div className={`flex items-center text-xs ${getGrowthClass(stats?.customersGrowth)} mt-1`}>
                  <i className={getGrowthIcon(stats?.customersGrowth)}></i>
                  <span>{Math.abs(stats?.customersGrowth)}% vs {t.lastMonth}</span>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="text-gray-500 text-xs mb-1">{t.avgOrderValue}</div>
                <div className="text-2xl font-bold">{stats?.aov}</div>
                <div className={`flex items-center text-xs ${getGrowthClass(stats?.aovGrowth)} mt-1`}>
                  <i className={getGrowthIcon(stats?.aovGrowth)}></i>
                  <span>{Math.abs(stats?.aovGrowth)}% vs {t.lastMonth}</span>
                </div>
              </div>
            </div>
            
            {/* Sales Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">{t.salesOverview}</h3>
                <div className="flex text-xs">
                  <button 
                    className={`px-2 py-1 ${dateRange === 'week' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'} rounded-l-md`}
                    onClick={() => setDateRange('week')}
                  >
                    {language === 'en' ? 'Week' : language === 'ru' ? 'Неделя' : 'Hafta'}
                  </button>
                  <button 
                    className={`px-2 py-1 ${dateRange === 'month' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'} rounded-r-md`}
                    onClick={() => setDateRange('month')}
                  >
                    {language === 'en' ? 'Month' : language === 'ru' ? 'Месяц' : 'Oy'}
                  </button>
                </div>
              </div>
              <div className="h-48 w-full bg-gray-50 rounded flex items-center justify-center">
                <div className="text-xs text-gray-400">
                  {language === 'en' 
                    ? 'Chart visualization would render here' 
                    : language === 'ru' 
                      ? 'Здесь будет отображаться график' 
                      : 'Bu yerda diagramma ko\'rsatiladi'}
                </div>
              </div>
            </div>
            
            {/* Recent Orders */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">{t.recentOrders}</h3>
                <a href="#" className="text-xs text-primary">{t.viewAll}</a>
              </div>
              <div className="space-y-3">
                {orders?.slice(0, 3).map((order: any) => {
                  const status = getStatusLabel(order.status);
                  const date = new Date(order.orderDate);
                  const formattedDate = date.toLocaleDateString(
                    language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'uz-UZ', 
                    { month: 'short', day: 'numeric', year: 'numeric' }
                  );
                  const formattedTime = date.toLocaleTimeString(
                    language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'uz-UZ',
                    { hour: '2-digit', minute: '2-digit' }
                  );
                  
                  return (
                    <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">#{order.id.toString().padStart(4, '0')}</div>
                          <div className="text-xs text-gray-500">{formattedDate} • {formattedTime}</div>
                        </div>
                        <div className="text-sm font-semibold">{formatPrice(order.totalAmount)}</div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs">
                          {language === 'en' ? 'Order ID' : language === 'ru' ? 'Заказ №' : 'Buyurtma №'} {order.id}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.className}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Inventory Status */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">{t.inventoryStatus}</h3>
                <a href="#" className="text-xs text-primary">{t.manage}</a>
              </div>
              <div className="space-y-3">
                {products?.slice(0, 3).map((product: any) => {
                  const status = getInventoryStatus(product);
                  return (
                    <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded bg-gray-100 flex items-center justify-center ${getProductIconColor(product.type)} shrink-0`}>
                          <i className={getProductIcon(product.type)}></i>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            {product.type.charAt(0).toUpperCase() + product.type.slice(1)} • Digital
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${status.className}`}>{status.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Admin Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <a href="#" className="flex flex-col items-center py-2 px-3 text-primary">
            <i className="ri-dashboard-line text-xl"></i>
            <span className="text-xs mt-1">
              {language === 'en' ? 'Dashboard' : language === 'ru' ? 'Панель' : 'Boshqaruv'}
            </span>
          </a>
          
          <a href="#" className="flex flex-col items-center py-2 px-3 text-gray-500">
            <i className="ri-store-2-line text-xl"></i>
            <span className="text-xs mt-1">
              {language === 'en' ? 'Products' : language === 'ru' ? 'Продукты' : 'Mahsulotlar'}
            </span>
          </a>
          
          <a href="#" className="flex flex-col items-center py-2 px-3 text-gray-500">
            <i className="ri-file-list-3-line text-xl"></i>
            <span className="text-xs mt-1">
              {language === 'en' ? 'Orders' : language === 'ru' ? 'Заказы' : 'Buyurtmalar'}
            </span>
          </a>
          
          <a href="#" className="flex flex-col items-center py-2 px-3 text-gray-500">
            <i className="ri-user-3-line text-xl"></i>
            <span className="text-xs mt-1">
              {language === 'en' ? 'Customers' : language === 'ru' ? 'Клиенты' : 'Mijozlar'}
            </span>
          </a>
          
          <a href="#" className="flex flex-col items-center py-2 px-3 text-gray-500">
            <i className="ri-settings-3-line text-xl"></i>
            <span className="text-xs mt-1">
              {language === 'en' ? 'Settings' : language === 'ru' ? 'Настройки' : 'Sozlamalar'}
            </span>
          </a>
        </div>
      </nav>
    </>
  );
};

export default AdminDashboard;
