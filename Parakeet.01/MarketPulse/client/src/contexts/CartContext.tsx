import { createContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Product } from '@shared/schema';
import { CartContextType, CartItem } from '@shared/types';

export const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<(CartItem & { product: Product })[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch cart data
  const { data: cartData, isLoading, isError } = useQuery({
    queryKey: ['/api/cart'],
    onSuccess: (data) => {
      setItems(data.items || []);
      setTotalItems(data.totalItems || 0);
      setTotalPrice(data.totalPrice || 0);
    },
  });

  // Add item to cart mutation
  const { mutate: addItemMutation } = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      return apiRequest('POST', '/api/cart/items', { productId, quantity });
    },
    onSuccess: (res) => {
      res.json().then(data => {
        setItems(data.items || []);
        setTotalItems(data.totalItems || 0);
        setTotalPrice(data.totalPrice || 0);
        
        // Invalidate cart query
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
      console.error('Add to cart error:', error);
    },
  });

  // Remove item from cart mutation
  const { mutate: removeItemMutation } = useMutation({
    mutationFn: async (itemId: number) => {
      return apiRequest('DELETE', `/api/cart/items/${itemId}`);
    },
    onSuccess: (res) => {
      res.json().then(data => {
        setItems(data.items || []);
        setTotalItems(data.totalItems || 0);
        setTotalPrice(data.totalPrice || 0);
        
        // Invalidate cart query
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive',
      });
      console.error('Remove from cart error:', error);
    },
  });

  // Update item quantity mutation
  const { mutate: updateQuantityMutation } = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      return apiRequest('PATCH', `/api/cart/items/${itemId}`, { quantity });
    },
    onSuccess: (res) => {
      res.json().then(data => {
        setItems(data.items || []);
        setTotalItems(data.totalItems || 0);
        setTotalPrice(data.totalPrice || 0);
        
        // Invalidate cart query
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update item quantity',
        variant: 'destructive',
      });
      console.error('Update quantity error:', error);
    },
  });

  // Add item to cart
  const addItem = (product: Product, quantity: number = 1) => {
    addItemMutation({ productId: product.id, quantity });
    
    // Show success toast
    toast({
      title: 'Item added to cart',
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    });
  };

  // Remove item from cart
  const removeItem = (productId: number) => {
    // Find the cart item with the matching productId
    const itemToRemove = items.find(item => item.product.id === productId);
    if (itemToRemove) {
      removeItemMutation(itemToRemove.id);
    }
  };

  // Update item quantity
  const updateQuantity = (itemId: number, quantity: number) => {
    updateQuantityMutation({ itemId, quantity });
  };

  // Clear cart (used after successful order)
  const clearCart = () => {
    // Remove all items one by one
    items.forEach(item => {
      removeItemMutation(item.id);
    });
  };

  // Calculate totals when items change
  useEffect(() => {
    if (items.length > 0) {
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const itemTotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      setTotalItems(itemCount);
      setTotalPrice(itemTotal);
    } else {
      setTotalItems(0);
      setTotalPrice(0);
    }
  }, [items]);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};
