import { useEffect, useContext } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useCart } from "@/hooks/useCart";
import { LanguageContext } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { showTelegramPayment, showTelegramMainButton, hideTelegramMainButton } from "@/lib/telegram";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { language } = useContext(LanguageContext);
  const [, navigate] = useLocation();
  const t = translations[language];
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create order mutation
  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: async () => {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      return apiRequest('POST', '/api/orders', {
        totalAmount: totalPrice,
        status: 'pending',
        paymentMethod: 'telegram',
        items: orderItems
      });
    },
    onSuccess: async (res) => {
      const order = await res.json();
      
      // Invalidate orders query to refresh order list
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      // Clear cart
      clearCart();
      
      // Show success toast
      toast({
        title: t.orderCreated,
        description: t.orderConfirmation,
        duration: 3000,
      });
      
      // Navigate to orders page
      navigate('/orders');
    },
    onError: (error) => {
      toast({
        title: t.orderFailed,
        description: error.toString(),
        variant: 'destructive',
        duration: 3000,
      });
    },
  });

  // Process checkout
  const handleCheckout = () => {
    if (items.length === 0) return;
    
    // Show Telegram payment confirmation
    showTelegramPayment({
      title: `Parakeet Order (${totalItems} items)`,
      description: `Payment for ${totalItems} items`,
      amount: totalPrice,
      currency: "USD",
      callback: (success) => {
        if (success) {
          // Process the order
          createOrder();
        }
      }
    });
  };

  // Setup Telegram Main Button for checkout
  useEffect(() => {
    if (items.length > 0) {
      showTelegramMainButton(`${t.checkout} (${formatPrice(totalPrice)})`, handleCheckout);
    } else {
      hideTelegramMainButton();
    }
    
    return () => {
      hideTelegramMainButton();
    };
  }, [items, totalPrice, language]);

  // Handle quantity change
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <>
      <Header showBack title={t.cart} />
      
      <main className="flex-1 overflow-y-auto pb-16">
        {items.length === 0 ? (
          // Empty cart state
          <div className="flex flex-col items-center justify-center h-64 px-4 text-center">
            <i className="ri-shopping-cart-line text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t.emptyCart}</h3>
            <p className="text-sm text-gray-500 mb-6">{t.startShoppingMessage}</p>
            <button 
              className="px-4 py-2 bg-primary text-white rounded-lg shadow-sm"
              onClick={() => navigate("/")}
            >
              {t.startShopping}
            </button>
          </div>
        ) : (
          // Cart items
          <div className="px-4 py-4">
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex">
                    <div className="w-16 h-16 rounded bg-gray-100 overflow-hidden">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <h3 className="font-medium text-sm line-clamp-1">{item.product.name}</h3>
                      <div className="text-sm font-bold mt-1">{formatPrice(item.product.price)}</div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <button 
                            className="w-7 h-7 flex items-center justify-center text-gray-500 border border-gray-200 rounded-l-md"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <i className="ri-subtract-line"></i>
                          </button>
                          <div className="w-9 h-7 flex items-center justify-center border-t border-b border-gray-200">
                            {item.quantity}
                          </div>
                          <button 
                            className="w-7 h-7 flex items-center justify-center text-gray-500 border border-gray-200 rounded-r-md"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <i className="ri-add-line"></i>
                          </button>
                        </div>
                        
                        <button 
                          className="text-sm text-gray-500 hover:text-error"
                          onClick={() => removeItem(item.product.id)}
                          aria-label={t.removeItem}
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Order summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium mb-3">{t.orderSummary}</h3>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.subtotal}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t.shipping}</span>
                  <span>{t.free}</span>
                </div>
              </div>
              
              <div className="h-px bg-gray-200 my-3"></div>
              
              <div className="flex justify-between font-bold">
                <span>{t.total}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
            
            {/* Checkout button for browsers without Telegram */}
            <div className="mt-6">
              <button 
                className="w-full py-3 bg-primary text-white rounded-lg shadow-sm font-medium"
                onClick={handleCheckout}
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center justify-center">
                    <i className="ri-loader-2-line animate-spin mr-2"></i>
                    {t.processing}
                  </span>
                ) : (
                  `${t.checkout} (${formatPrice(totalPrice)})`
                )}
              </button>
            </div>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </>
  );
};

export default Cart;
