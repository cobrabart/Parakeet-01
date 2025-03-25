import { useContext } from "react";
import { Link, useLocation } from "wouter";
import { LanguageContext } from "@/contexts/LanguageContext";
import { NavItem } from "@shared/types";

export const BottomNavigation = () => {
  const [location] = useLocation();
  const { language } = useContext(LanguageContext);

  const navItems: NavItem[] = [
    {
      key: "home",
      icon: "ri-home-5-line",
      label: {
        en: "Home",
        ru: "Главная",
        uz: "Asosiy"
      },
      path: "/"
    },
    {
      key: "shop",
      icon: "ri-store-2-line",
      label: {
        en: "Shop",
        ru: "Магазин",
        uz: "Do'kon"
      },
      path: "/shop"
    },
    {
      key: "cart",
      icon: "ri-shopping-cart-line",
      label: {
        en: "Cart",
        ru: "Корзина",
        uz: "Savat"
      },
      path: "/cart"
    },
    {
      key: "orders",
      icon: "ri-file-list-3-line",
      label: {
        en: "Orders",
        ru: "Заказы",
        uz: "Buyurtmalar"
      },
      path: "/orders"
    },
    {
      key: "profile",
      icon: "ri-user-3-line",
      label: {
        en: "Profile",
        ru: "Профиль",
        uz: "Profil"
      },
      path: "/profile"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.key}
            href={item.path}
            className={`flex flex-col items-center py-2 px-3 ${
              location === item.path ? "text-primary" : "text-gray-500"
            }`}
          >
            <i className={`${item.icon} text-xl`}></i>
            <span className="text-xs mt-1">{item.label[language]}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
