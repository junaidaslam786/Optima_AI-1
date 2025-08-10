"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAddOrUpdateCartItemMutation } from '@/redux/features/cartItems/cartItemsApi';
import { 
  addToGuestCart, 
  getGuestCart, 
  updateGuestCartQuantity,
  removeFromGuestCart,
  getGuestCartItemCount 
} from '@/lib/guestCart';
import toast from 'react-hot-toast';

export const useCart = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [guestCartCount, setGuestCartCount] = useState(0);
  
  const [addOrUpdateCartItem, { isLoading: isAddingToCart }] = useAddOrUpdateCartItemMutation();

  // Update guest cart count when component mounts or cart changes
  useEffect(() => {
    if (!userId) {
      setGuestCartCount(getGuestCartItemCount());
    }
  }, [userId]);

  const addToCart = async (productId: string, quantity: number = 1, productName?: string) => {
    try {
      if (userId) {
        // User is logged in - use API
        await addOrUpdateCartItem({
          user_id: userId,
          partner_product_id: productId,
          quantity,
        }).unwrap();
      } else {
        // Guest user - use local storage
        addToGuestCart(productId, quantity);
        setGuestCartCount(getGuestCartItemCount());
      }
      
      toast.success(`${productName || 'Product'} added to cart!`);
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
      return false;
    }
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    try {
      if (userId) {
        // User is logged in - use API
        if (quantity <= 0) {
          // TODO: Implement remove from cart API
          console.log('Remove from user cart:', productId);
        } else {
          await addOrUpdateCartItem({
            user_id: userId,
            partner_product_id: productId,
            quantity,
          }).unwrap();
        }
      } else {
        // Guest user - use local storage
        updateGuestCartQuantity(productId, quantity);
        setGuestCartCount(getGuestCartItemCount());
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update cart:', error);
      toast.error('Failed to update cart. Please try again.');
      return false;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      if (userId) {
        // TODO: Implement remove from user cart API
        console.log('Remove from user cart:', productId);
      } else {
        // Guest user - use local storage
        removeFromGuestCart(productId);
        setGuestCartCount(getGuestCartItemCount());
      }
      
      toast.success('Item removed from cart');
      return true;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      toast.error('Failed to remove from cart. Please try again.');
      return false;
    }
  };

  const getCartData = () => {
    if (userId) {
      // TODO: Return user cart data from API
      return { items: [], count: 0 };
    } else {
      const guestCart = getGuestCart();
      return {
        items: guestCart.items,
        count: guestCartCount,
        guestId: guestCart.guest_id
      };
    }
  };

  return {
    addToCart,
    updateCartQuantity,
    removeFromCart,
    getCartData,
    isLoading: isAddingToCart,
    isLoggedIn: !!userId,
    cartCount: userId ? 0 : guestCartCount, // TODO: Get actual user cart count from API
  };
};
