import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Cart from "@/pages/Cart";
import Orders from "@/pages/Orders";
import Profile from "@/pages/Profile";
import UserDashboard from "@/pages/UserDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import ProductDetail from "@/pages/ProductDetail";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { initTelegramApp } from "./lib/telegram";
// Import AIChatAssistant at the application level to ensure it's always available
import AIChatAssistant from "@/components/AIChatAssistant";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/shop/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/orders" component={Orders} />
      <Route path="/profile" component={Profile} />
      <Route path="/user-dashboard" component={UserDashboard} />
      <Route path="/admin-dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize Telegram Mini App
    initTelegramApp();
    
    // Add Remix Icon CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <CartProvider>
          <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col relative">
            <Router />
            {/* Add AIChatAssistant at app level so it's available on all pages */}
            <AIChatAssistant />
            <Toaster />
          </div>
        </CartProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
