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
    const cartData = localStorage.getItem('guest_cart');
    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error('Error parsing guest cart:', error);
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
    localStorage.setItem('guest_cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart:', error);
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
  localStorage.removeItem('guest_cart');
};

// Get guest cart item count
export const getGuestCartItemCount = (): number => {
  const cart = getGuestCart();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

// Convert guest cart to user cart (for when user creates account)
export const transferGuestCartToUser = async (userId: string): Promise<void> => {
  const guestCart = getGuestCart();
  
  if (guestCart.items.length === 0) {
    clearGuestCart();
    return;
  }

  // Here you would typically call an API to transfer the cart items
  // For now, we'll just clear the guest cart after transfer
  try {
    // TODO: Implement API call to transfer guest cart items to user account
    // await transferCartAPI(userId, guestCart.items);
    console.log(`Transferring ${guestCart.items.length} items to user ${userId}`);
    
    clearGuestCart();
  } catch (error) {
    console.error('Error transferring guest cart to user:', error);
  }
};
