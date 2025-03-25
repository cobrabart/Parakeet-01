import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertProductSchema, insertCategorySchema, insertUserSchema, insertOrderSchema, insertOrderItemSchema, insertCartItemSchema, insertSavedProductSchema } from "@shared/schema";
import { aiChat } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // === User Routes ===
  
  // Get current user
  app.get("/api/user", async (req: Request, res: Response) => {
    // In a real app, we would get the user from the session/JWT
    // For now, we'll return the regular user (ID 2)
    const user = await storage.getUser(2);
    
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // Login (simplified for demo)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // Update user settings
  app.patch("/api/user", async (req: Request, res: Response) => {
    // In a real app, we would get the user ID from the session/JWT
    const userId = 2; // Regular user
    
    const updateSchema = z.object({
      fullName: z.string().optional(),
      email: z.string().email().optional(),
      language: z.string().optional()
    });
    
    try {
      const validatedData = updateSchema.parse(req.body);
      const user = await storage.updateUser(userId, validatedData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid input", error });
    }
  });
  
  // === Category Routes ===
  
  // Get all categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });
  
  // === Product Routes ===
  
  // Get all products
  app.get("/api/products", async (_req: Request, res: Response) => {
    const products = await storage.getProducts();
    res.json(products);
  });
  
  // Get products by category
  app.get("/api/categories/:categoryId/products", async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const products = await storage.getProductsByCategory(categoryId);
    res.json(products);
  });
  
  // Get featured products
  app.get("/api/products/featured", async (_req: Request, res: Response) => {
    const products = await storage.getFeaturedProducts();
    res.json(products);
  });
  
  // Get popular services
  app.get("/api/services/popular", async (_req: Request, res: Response) => {
    const services = await storage.getPopularServices();
    res.json(services);
  });
  
  // Search products
  app.get("/api/products/search", async (req: Request, res: Response) => {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ message: "Query parameter required" });
    }
    
    const products = await storage.searchProducts(query);
    res.json(products);
  });
  
  // Get a specific product - this must come AFTER other /api/products/... routes
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    const product = await storage.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // If it's a course, include course details
    if (product.type === 'course') {
      const course = await storage.getCourseByProductId(id);
      res.json({ ...product, course });
    } else {
      res.json(product);
    }
  });
  
  // === Course Routes ===
  
  // Get trending courses
  app.get("/api/courses/trending", async (_req: Request, res: Response) => {
    const courses = await storage.getTrendingCourses();
    res.json(courses);
  });
  
  // === Order Routes ===
  
  // Get user orders
  app.get("/api/orders", async (_req: Request, res: Response) => {
    // In a real app, we would get the user ID from the session/JWT
    const userId = 2; // Regular user
    
    const orders = await storage.getOrders(userId);
    res.json(orders);
  });
  
  // Get specific order with items
  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    
    const order = await storage.getOrderWithItems(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  });
  
  // Create new order
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the session/JWT
      const userId = 2; // Regular user
      
      // Validate order data
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId,
        orderDate: new Date()
      });
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // If order items are provided, create them
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const orderItem = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id
          });
          
          await storage.createOrderItem(orderItem);
        }
      }
      
      // Get complete order with items
      const completeOrder = await storage.getOrderWithItems(order.id);
      
      // Clear cart after successful order
      const cart = await storage.getCartByUserId(userId);
      if (cart) {
        const cartItems = await storage.getCartItems(cart.id);
        for (const item of cartItems) {
          await storage.removeCartItem(item.id);
        }
      }
      
      res.status(201).json(completeOrder);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data", error });
    }
  });
  
  // === Cart Routes ===
  
  // Get user cart
  app.get("/api/cart", async (_req: Request, res: Response) => {
    // In a real app, we would get the user ID from the session/JWT
    const userId = 2; // Regular user
    
    // Get or create cart
    let cart = await storage.getCartByUserId(userId);
    
    if (!cart) {
      cart = await storage.createCart({ userId });
    }
    
    const cartItems = await storage.getCartItems(cart.id);
    
    res.json({
      id: cart.id,
      items: cartItems,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    });
  });
  
  // Add item to cart
  app.post("/api/cart/items", async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the session/JWT
      const userId = 2; // Regular user
      
      // Get or create cart
      let cart = await storage.getCartByUserId(userId);
      
      if (!cart) {
        cart = await storage.createCart({ userId });
      }
      
      // Validate cart item data
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        cartId: cart.id
      });
      
      // Add item to cart
      await storage.addCartItem(cartItemData);
      
      // Return updated cart
      const cartItems = await storage.getCartItems(cart.id);
      
      res.status(201).json({
        id: cart.id,
        items: cartItems,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data", error });
    }
  });
  
  // Update cart item quantity
  app.patch("/api/cart/items/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    const { quantity } = req.body;
    
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    
    await storage.updateCartItemQuantity(id, quantity);
    
    // In a real app, we would get the user ID from the session/JWT
    const userId = 2; // Regular user
    
    // Get cart
    const cart = await storage.getCartByUserId(userId);
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    // Return updated cart
    const cartItems = await storage.getCartItems(cart.id);
    
    res.json({
      id: cart.id,
      items: cartItems,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    });
  });
  
  // Remove item from cart
  app.delete("/api/cart/items/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    await storage.removeCartItem(id);
    
    // In a real app, we would get the user ID from the session/JWT
    const userId = 2; // Regular user
    
    // Get cart
    const cart = await storage.getCartByUserId(userId);
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    // Return updated cart
    const cartItems = await storage.getCartItems(cart.id);
    
    res.json({
      id: cart.id,
      items: cartItems,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    });
  });
  
  // === Saved Products Routes ===
  
  // Get user saved products
  app.get("/api/saved-products", async (_req: Request, res: Response) => {
    // In a real app, we would get the user ID from the session/JWT
    const userId = 2; // Regular user
    
    const savedProducts = await storage.getSavedProducts(userId);
    res.json(savedProducts);
  });
  
  // Save a product
  app.post("/api/saved-products", async (req: Request, res: Response) => {
    try {
      // In a real app, we would get the user ID from the session/JWT
      const userId = 2; // Regular user
      
      // Validate saved product data
      const savedProductData = insertSavedProductSchema.parse({
        ...req.body,
        userId
      });
      
      // Save product
      await storage.addSavedProduct(savedProductData);
      
      // Return updated saved products
      const savedProducts = await storage.getSavedProducts(userId);
      res.status(201).json(savedProducts);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error });
    }
  });
  
  // Remove saved product
  app.delete("/api/saved-products/:productId", async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    // In a real app, we would get the user ID from the session/JWT
    const userId = 2; // Regular user
    
    await storage.removeSavedProduct(userId, productId);
    
    // Return updated saved products
    const savedProducts = await storage.getSavedProducts(userId);
    res.json(savedProducts);
  });
  
  // === Dashboard Stats Routes ===
  
  // Get user dashboard stats
  app.get("/api/user/dashboard-stats", async (_req: Request, res: Response) => {
    // In a real app, we would get the user ID from the session/JWT
    const userId = 2; // Regular user
    
    const stats = await storage.getUserDashboardStats(userId);
    res.json(stats);
  });
  
  // Get admin dashboard stats
  app.get("/api/admin/dashboard-stats", async (_req: Request, res: Response) => {
    // In a real app, we would check if the user is an admin
    
    const stats = await storage.getAdminDashboardStats();
    res.json(stats);
  });
  
  // === AI Chat Routes ===
  
  // Send message to AI assistant
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: "Message is required" });
    }
    
    try {
      const response = await aiChat(message);
      res.json(response);
    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({ message: "Error processing your request" });
    }
  });

  return httpServer;
}
