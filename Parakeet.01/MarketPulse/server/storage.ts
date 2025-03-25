import { 
  User, InsertUser, Category, InsertCategory, Product, InsertProduct, 
  Course, InsertCourse, Order, InsertOrder, OrderItem, InsertOrderItem,
  Cart, InsertCart, CartItem, InsertCartItem, SavedProduct, InsertSavedProduct
} from "@shared/schema";

import { v4 as uuidv4 } from 'uuid';
import { ProductWithDetails, CourseWithDetails, OrderWithItems, UserDashboardStats, AdminDashboardStats } from "@shared/types";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product methods
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  getPopularServices(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Course methods
  getCourseByProductId(productId: number): Promise<Course | undefined>;
  getTrendingCourses(): Promise<(Product & { course: Course })[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // Order methods
  getOrders(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderWithItems(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Cart methods
  getCartByUserId(userId: number): Promise<Cart | undefined>;
  getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]>;
  createCart(cart: InsertCart): Promise<Cart>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  
  // Saved Products methods
  getSavedProducts(userId: number): Promise<(SavedProduct & { product: Product })[]>;
  addSavedProduct(savedProduct: InsertSavedProduct): Promise<SavedProduct>;
  removeSavedProduct(userId: number, productId: number): Promise<boolean>;
  
  // Dashboard stats
  getUserDashboardStats(userId: number): Promise<UserDashboardStats>;
  getAdminDashboardStats(): Promise<AdminDashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private courses: Map<number, Course>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private savedProducts: Map<number, SavedProduct>;
  
  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentCourseId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentCartId: number;
  private currentCartItemId: number;
  private currentSavedProductId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.courses = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.savedProducts = new Map();
    
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentCourseId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentCartId = 1;
    this.currentCartItemId = 1;
    this.currentSavedProductId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId,
    );
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.featured,
    );
  }
  
  async getPopularServices(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.popular && product.type === 'service',
    );
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      (product) => 
        product.name.toLowerCase().includes(lowercaseQuery) || 
        product.description.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }
  
  // Course methods
  async getCourseByProductId(productId: number): Promise<Course | undefined> {
    return Array.from(this.courses.values()).find(
      (course) => course.productId === productId,
    );
  }
  
  async getTrendingCourses(): Promise<(Product & { course: Course })[]> {
    const courseProducts = Array.from(this.products.values()).filter(
      (product) => product.type === 'course',
    );
    
    return courseProducts.map(product => {
      const course = Array.from(this.courses.values()).find(
        course => course.productId === product.id
      );
      return { ...product, course: course! };
    }).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }
  
  // Order methods
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderWithItems(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => {
        const product = this.products.get(item.productId);
        return { ...item, product: product! };
      });
    
    return { ...order, items };
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { ...insertOrder, id };
    this.orders.set(id, order);
    return order;
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Cart methods
  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(
      (cart) => cart.userId === userId,
    );
  }
  
  async getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]> {
    return Array.from(this.cartItems.values())
      .filter(item => item.cartId === cartId)
      .map(item => {
        const product = this.products.get(item.productId);
        return { ...item, product: product! };
      });
  }
  
  async createCart(insertCart: InsertCart): Promise<Cart> {
    const id = this.currentCartId++;
    const cart: Cart = { ...insertCart, id };
    this.carts.set(id, cart);
    return cart;
  }
  
  async addCartItem(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.cartId === insertCartItem.cartId && item.productId === insertCartItem.productId
    );
    
    if (existingItem) {
      // Update quantity instead
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + insertCartItem.quantity) as Promise<CartItem>;
    }
    
    const id = this.currentCartItemId++;
    const cartItem: CartItem = { ...insertCartItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return { ...cartItem, quantity: 0 };
    }
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  // Saved Products methods
  async getSavedProducts(userId: number): Promise<(SavedProduct & { product: Product })[]> {
    return Array.from(this.savedProducts.values())
      .filter(saved => saved.userId === userId)
      .map(saved => {
        const product = this.products.get(saved.productId);
        return { ...saved, product: product! };
      });
  }
  
  async addSavedProduct(insertSavedProduct: InsertSavedProduct): Promise<SavedProduct> {
    // Check if already saved
    const existing = Array.from(this.savedProducts.values()).find(
      saved => saved.userId === insertSavedProduct.userId && saved.productId === insertSavedProduct.productId
    );
    
    if (existing) return existing;
    
    const id = this.currentSavedProductId++;
    const savedProduct: SavedProduct = { ...insertSavedProduct, id };
    this.savedProducts.set(id, savedProduct);
    return savedProduct;
  }
  
  async removeSavedProduct(userId: number, productId: number): Promise<boolean> {
    const savedProduct = Array.from(this.savedProducts.values()).find(
      saved => saved.userId === userId && saved.productId === productId
    );
    
    if (!savedProduct) return false;
    return this.savedProducts.delete(savedProduct.id);
  }
  
  // Dashboard stats
  async getUserDashboardStats(userId: number): Promise<UserDashboardStats> {
    const userOrders = Array.from(this.orders.values()).filter(
      order => order.userId === userId
    );
    
    const completed = userOrders.filter(order => order.status === 'completed').length;
    
    const saved = Array.from(this.savedProducts.values()).filter(
      saved => saved.userId === userId
    ).length;
    
    return {
      orders: userOrders.length,
      saved,
      completed
    };
  }
  
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    const orders = Array.from(this.orders.values());
    
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(order => order.userId)).size;
    const aov = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
    
    // Simulate growth metrics
    return {
      sales: `$${totalSales}`,
      orders: totalOrders,
      customers: uniqueCustomers,
      aov: `$${aov}`,
      salesGrowth: 12.5,
      ordersGrowth: 8.3,
      customersGrowth: 5.2,
      aovGrowth: -3.1
    };
  }
  
  // Initialize with sample data
  private initializeData() {
    // Create admin user
    this.createUser({
      username: 'admin',
      password: 'admin123',
      email: 'admin@apexbart.com',
      fullName: 'Admin User',
      role: 'admin',
      language: 'en',
      avatarUrl: '',
      isAdmin: true
    });

    // Create regular user
    this.createUser({
      username: 'user',
      password: 'user123',
      email: 'user@example.com',
      fullName: 'John Doe',
      role: 'user',
      language: 'en',
      avatarUrl: '',
      isAdmin: false
    });

    // Create categories
    const aiCategory = this.createCategory({
      name: 'AI Services',
      slug: 'ai-services',
      icon: 'ri-robot-line',
      color: '#2B5AEC'
    });
    
    const copywritingCategory = this.createCategory({
      name: 'Copywriting',
      slug: 'copywriting',
      icon: 'ri-file-text-line',
      color: '#6C63FF'
    });
    
    const toolsCategory = this.createCategory({
      name: 'Tools',
      slug: 'tools',
      icon: 'ri-tools-line',
      color: '#10B981'
    });
    
    const coursesCategory = this.createCategory({
      name: 'Courses',
      slug: 'courses',
      icon: 'ri-book-open-line',
      color: '#F59E0B'
    });
    
    const analyticsCategory = this.createCategory({
      name: 'Analytics',
      slug: 'analytics',
      icon: 'ri-pie-chart-line',
      color: '#3B82F6'
    });

    // Create AI Services
    const chatbotProduct = this.createProduct({
      name: 'AI Chatbot Development',
      description: 'Custom AI chatbot development for your business with seamless integration',
      price: 29900, // $299.00
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad0b3',
      type: 'service',
      categoryId: 1, // AI Services
      rating: 49, // 4.9
      sales: 120,
      featured: true,
      popular: true,
      available: true,
      details: {
        features: [
          'Custom training on your business data',
          'Seamless website integration',
          '24/7 customer support automation',
          'Multi-platform deployment'
        ],
        duration: '2-3 weeks',
        support: '12 months included'
      }
    });
    
    this.createProduct({
      name: 'Predictive Analytics System',
      description: 'AI-powered analytics to predict customer behavior and business trends',
      price: 39900, // $399.00
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      type: 'service',
      categoryId: 1, // AI Services
      rating: 47, // 4.7
      sales: 85,
      featured: false,
      popular: true,
      available: true,
      details: {
        features: [
          'Data collection and cleansing',
          'Custom ML model development',
          'Interactive dashboard',
          'Quarterly model retraining'
        ],
        duration: '4-6 weeks',
        support: '12 months included'
      }
    });
    
    this.createProduct({
      name: 'AI Content Generator',
      description: 'Generate high-quality content for your website, blog, and social media',
      price: 19900, // $199.00
      imageUrl: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74',
      type: 'service',
      categoryId: 1, // AI Services
      rating: 46, // 4.6
      sales: 210,
      featured: false,
      popular: true,
      available: true,
      details: {
        features: [
          'Blog post generation',
          'Social media content',
          'Product descriptions',
          'Email newsletters'
        ],
        duration: 'Ongoing subscription',
        support: 'Unlimited during subscription'
      }
    });
    
    this.createProduct({
      name: 'AI Customer Segmentation',
      description: 'Advanced customer segmentation using machine learning algorithms',
      price: 24900, // $249.00
      imageUrl: 'https://images.unsplash.com/photo-1543286386-713bdd548da4',
      type: 'service',
      categoryId: 1, // AI Services
      rating: 48, // 4.8
      sales: 65,
      featured: true,
      popular: false,
      available: true,
      details: {
        features: [
          'Customer behavior analysis',
          'Segmentation model development',
          'Marketing strategy recommendations',
          'Quarterly reports'
        ],
        duration: '2-3 weeks initial setup',
        support: '6 months included'
      }
    });
    
    // Create Copywriting Services
    this.createProduct({
      name: 'SEO & Content Strategy',
      description: 'Comprehensive SEO analysis and content strategy development',
      price: 34900, // $349.00
      imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a',
      type: 'service',
      categoryId: 2, // Copywriting
      rating: 46, // 4.6
      sales: 95,
      featured: false,
      popular: true,
      available: true,
      details: {
        features: [
          'Keyword research',
          'Competitor analysis',
          'Content calendar',
          'On-page SEO optimization'
        ],
        duration: '2 weeks',
        support: '30 days revisions'
      }
    });
    
    // Create Automation Tools
    this.createProduct({
      name: 'SEO Automation Tool',
      description: 'Automated SEO analysis and optimization tool for websites',
      price: 14900, // $149.00
      imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603',
      type: 'tool',
      categoryId: 3, // Tools
      rating: 47, // 4.7
      sales: 85,
      featured: true,
      popular: false,
      available: true,
      details: {
        features: [
          'Keyword rank tracking',
          'Competitor analysis',
          'Content optimization suggestions',
          'Backlink monitoring'
        ],
        duration: 'Lifetime access',
        support: '12 months included'
      }
    });
    
    // Create Courses
    const aiStrategyProduct = this.createProduct({
      name: 'AI Strategy Masterclass',
      description: 'Comprehensive course on implementing AI strategy in your business',
      price: 19900, // $199.00
      imageUrl: 'https://images.unsplash.com/photo-1581472723648-909f4851d4ae',
      type: 'course',
      categoryId: 4, // Courses
      rating: 48, // 4.8
      sales: 150,
      featured: true,
      popular: true,
      available: true,
      details: {
        features: [
          'AI business use cases',
          'Implementation roadmap',
          'ROI calculation',
          'Case studies'
        ],
        level: 'Intermediate to Advanced',
        certification: true
      }
    });
    
    this.createCourse({
      productId: aiStrategyProduct.id,
      modules: 10,
      duration: 360 // 6 hours
    });
    
    const pythonProduct = this.createProduct({
      name: 'Python for Automation',
      description: 'Learn to automate business processes using Python',
      price: 14900, // $149.00
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
      type: 'course',
      categoryId: 4, // Courses
      rating: 47, // 4.7
      sales: 180,
      featured: false,
      popular: true,
      available: true,
      details: {
        features: [
          'Python fundamentals',
          'Web scraping',
          'Data processing',
          'Scheduling and automation'
        ],
        level: 'Beginner to Intermediate',
        certification: true
      }
    });
    
    this.createCourse({
      productId: pythonProduct.id,
      modules: 12,
      duration: 480 // 8 hours
    });
    
    this.createProduct({
      name: 'Website Modernization',
      description: 'Transform your outdated website into a modern, responsive design',
      price: 49900, // $499.00
      imageUrl: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974',
      type: 'service',
      categoryId: 3, // Tools
      rating: 48, // 4.8
      sales: 150,
      featured: false,
      popular: true,
      available: true,
      details: {
        features: [
          'Responsive design',
          'Performance optimization',
          'SEO improvements',
          'Content migration'
        ],
        duration: '4-6 weeks',
        support: '30 days post-launch'
      }
    });
    
    // Create sample order for user
    const order = this.createOrder({
      userId: 2, // regular user
      totalAmount: 29900,
      status: 'completed',
      orderDate: new Date('2023-05-15'),
      paymentMethod: 'telegram',
      details: {}
    });
    
    this.createOrderItem({
      orderId: order.id,
      productId: chatbotProduct.id,
      quantity: 1,
      price: 29900
    });
    
    const inProgressOrder = this.createOrder({
      userId: 2, // regular user
      totalAmount: 19900,
      status: 'in_progress',
      orderDate: new Date('2023-04-28'),
      paymentMethod: 'telegram',
      details: {}
    });
    
    this.createOrderItem({
      orderId: inProgressOrder.id,
      productId: aiStrategyProduct.id,
      quantity: 1,
      price: 19900
    });
    
    // Create cart for user
    const cart = this.createCart({
      userId: 2
    });
    
    // Create saved products for user
    this.addSavedProduct({
      userId: 2,
      productId: 2 // SEO Automation Tool
    });
    
    this.addSavedProduct({
      userId: 2,
      productId: 5 // SEO & Content Strategy
    });
  }
}

export const storage = new MemStorage();
