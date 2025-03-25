import { Category, Product, Course, Order, OrderItem, User } from './schema';

// Enhanced product types with additional info

export interface ProductWithDetails extends Product {
  category: Category;
}

export interface CourseWithDetails extends ProductWithDetails {
  courseDetails: Course;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[];
}

export interface UserDashboardStats {
  orders: number;
  saved: number;
  completed: number;
}

export interface AdminDashboardStats {
  sales: string;
  orders: number;
  customers: number;
  aov: string; // Average Order Value
  salesGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  aovGrowth: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIAssistantResponse {
  message: string;
  options?: {
    text: string;
    value: string;
  }[];
  products?: ProductWithDetails[];
}

export interface CartContextType {
  items: (CartItem & { product: Product })[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

export interface NavItem {
  key: string;
  icon: string;
  label: {
    en: string;
    ru: string;
    uz: string;
  };
  path: string;
}

export interface CategoryItem {
  id: number;
  name: {
    en: string;
    ru: string;
    uz: string;
  };
  slug: string;
  icon: string;
  color: string;
}
