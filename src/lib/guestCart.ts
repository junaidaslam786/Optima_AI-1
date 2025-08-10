import Cookies from 'js-cookie';

// Guest cart utilities for managing cart items in cookies
export interface GuestCartItem {
  partner_product_id: string;
  quantity: number;
  added_at: string;
}

export interface GuestCart {
  items: GuestCartItem[];
  guest_id: string;
  created_at: string;
  updated_at: string;
}

// Cookie configuration
const CART_COOKIE_NAME = 'guest_cart';
const CART_COOKIE_OPTIONS = {
  expires: 30, // 30 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

// Generate a unique guest ID
export const generateGuestId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get guest cart from cookies
export const getGuestCart = (): GuestCart => {
  if (typeof window === 'undefined') {
    return {
      items: [],
      guest_id: generateGuestId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  try {
    const cartData = Cookies.get(CART_COOKIE_NAME);
    if (cartData) {
      const parsed = JSON.parse(cartData);
      // Validate the cart data structure
      if (parsed && parsed.items && Array.isArray(parsed.items)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error parsing guest cart from cookies:', error);
    // Clear corrupted cookie
    Cookies.remove(CART_COOKIE_NAME);
  }

  // Return empty cart if no data found or error occurred
  const newCart: GuestCart = {
    items: [],
    guest_id: generateGuestId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  saveGuestCart(newCart);
  return newCart;
};

// Save guest cart to cookies
export const saveGuestCart = (cart: GuestCart): void => {
  if (typeof window === 'undefined') return;
  
  try {
    cart.updated_at = new Date().toISOString();
    const cartString = JSON.stringify(cart);
    
    // Check if cart data is too large for cookies (cookies have ~4KB limit)
    if (cartString.length > 4000) {
      console.warn('Cart data too large for cookies, truncating items');
      // Keep only the most recent items if cart is too large
      const truncatedCart = {
        ...cart,
        items: cart.items.slice(-10) // Keep only last 10 items
      };
      Cookies.set(CART_COOKIE_NAME, JSON.stringify(truncatedCart), CART_COOKIE_OPTIONS);
    } else {
      Cookies.set(CART_COOKIE_NAME, cartString, CART_COOKIE_OPTIONS);
    }
  } catch (error) {
    console.error('Error saving guest cart to cookies:', error);
  }
};

// Add item to guest cart
export const addToGuestCart = (productId: string, quantity: number = 1): GuestCart => {
  const cart = getGuestCart();
  const existingItemIndex = cart.items.findIndex(
    item => item.partner_product_id === productId
  );

  if (existingItemIndex >= 0) {
    // Update quantity if item already exists
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      partner_product_id: productId,
      quantity,
      added_at: new Date().toISOString(),
    });
  }

  saveGuestCart(cart);
  return cart;
};

// Remove item from guest cart
export const removeFromGuestCart = (productId: string): GuestCart => {
  const cart = getGuestCart();
  cart.items = cart.items.filter(item => item.partner_product_id !== productId);
  saveGuestCart(cart);
  return cart;
};

// Update item quantity in guest cart
export const updateGuestCartQuantity = (productId: string, quantity: number): GuestCart => {
  const cart = getGuestCart();
  const existingItemIndex = cart.items.findIndex(
    item => item.partner_product_id === productId
  );

  if (existingItemIndex >= 0) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(existingItemIndex, 1);
    } else {
      cart.items[existingItemIndex].quantity = quantity;
    }
  }

  saveGuestCart(cart);
  return cart;
};

// Clear guest cart
export const clearGuestCart = (): void => {
  if (typeof window === 'undefined') return;
  Cookies.remove(CART_COOKIE_NAME);
};

// Get guest cart item count
export const getGuestCartItemCount = (): number => {
  const cart = getGuestCart();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

// Get guest cart total value (requires product prices)
export const getGuestCartTotal = async (): Promise<number> => {
  const cart = getGuestCart();
  let total = 0;
  
  // In a real application, you would fetch product prices from your API
  // For now, we'll return a placeholder calculation
  for (const item of cart.items) {
    // TODO: Fetch actual product price from API
    total += item.quantity * 50; // Placeholder: £50 per item
  }
  
  return total;
};

// Validate and cleanup cart items (remove invalid entries)
export const validateGuestCart = (): GuestCart => {
  const cart = getGuestCart();
  const validItems = cart.items.filter(item => 
    item.partner_product_id && 
    item.quantity > 0 && 
    typeof item.quantity === 'number'
  );
  
  if (validItems.length !== cart.items.length) {
    const cleanedCart = {
      ...cart,
      items: validItems
    };
    saveGuestCart(cleanedCart);
    return cleanedCart;
  }
  
  return cart;
};

// Convert guest cart to user cart (for when user creates account)
export const transferGuestCartToUser = async (userId: string): Promise<void> => {
  const guestCart = validateGuestCart();
  
  if (guestCart.items.length === 0) {
    clearGuestCart();
    return;
  }

  // Here you would typically call an API to transfer the cart items
  try {
    // TODO: Implement API call to transfer guest cart items to user account
    // await transferCartAPI(userId, guestCart.items);
    console.log(`Transferring ${guestCart.items.length} items to user ${userId}`);
    
    // Clear guest cart after successful transfer
    clearGuestCart();
  } catch (error) {
    console.error('Error transferring guest cart to user:', error);
    throw error; // Re-throw to handle in calling component
  }
};

// Merge guest cart with existing user cart
export const mergeGuestCartWithUserCart = async (userId: string): Promise<void> => {
  const guestCart = validateGuestCart();
  
  if (guestCart.items.length === 0) {
    clearGuestCart();
    return;
  }

  try {
    // TODO: Implement API call to merge guest cart with user's existing cart
    // This would typically:
    // 1. Fetch user's existing cart
    // 2. Merge items (combining quantities for same products)
    // 3. Update user's cart in database
    console.log(`Merging ${guestCart.items.length} guest items with user ${userId} cart`);
    
    clearGuestCart();
  } catch (error) {
    console.error('Error merging guest cart with user cart:', error);
    throw error;
  }
};
