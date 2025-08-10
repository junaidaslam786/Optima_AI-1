"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import Button from "@/components/ui/Button";
import { ShoppingCart, Minus, Plus, Trash2, RefreshCw } from "lucide-react";

interface CartItem {
  partner_product_id: string;
  quantity: number;
  added_at?: string;
}

interface ProductDetails {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
}

export default function CartPage() {
  const { getCartData, updateCartQuantity, removeFromCart, cartCount, refreshCart } = useCart();
  const [productDetails, setProductDetails] = useState<Record<string, ProductDetails>>({});
  const [loading, setLoading] = useState(true);
  const [cartData, setCartData] = useState<{ items: CartItem[]; count: number; guestId?: string }>({ items: [], count: 0 });
  const fetchedProductsRef = useRef<Set<string>>(new Set());

  // Create a stable reference for product IDs to avoid infinite re-renders
  const productIds = useMemo(() => 
    cartData.items.map(item => item.partner_product_id).sort().join(','),
    [cartData.items]
  );

  // Get cart data and update local state
  useEffect(() => {
    const data = getCartData();
    setCartData(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartCount]);

  // Fetch product details for cart items
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!cartData.items.length) {
        setLoading(false);
        return;
      }

      try {
        const productIds = cartData.items.map(item => item.partner_product_id);
        
        // Only fetch products we haven't fetched before
        const missingProductIds = productIds.filter(id => !fetchedProductsRef.current.has(id));
        
        if (missingProductIds.length === 0) {
          setLoading(false);
          return;
        }

        const details: Record<string, ProductDetails> = {};

        // Fetch each missing product's details
        await Promise.all(
          missingProductIds.map(async (productId) => {
            try {
              const response = await fetch(`/api/partner_products/${productId}`);
              if (response.ok) {
                const product = await response.json();
                details[productId] = {
                  id: product.id,
                  name: product.name || `Product ${productId}`,
                  price: product.price || 50,
                  image_url: product.image_url,
                  description: product.description,
                };
              } else {
                // Fallback for missing products
                details[productId] = {
                  id: productId,
                  name: `Product ${productId}`,
                  price: 50,
                };
              }
              
              // Mark this product as fetched
              fetchedProductsRef.current.add(productId);
            } catch (error) {
              console.error(`Error fetching product ${productId}:`, error);
              details[productId] = {
                id: productId,
                name: `Product ${productId}`,
                price: 50,
              };
              
              // Mark this product as fetched even if it failed
              fetchedProductsRef.current.add(productId);
            }
          })
        );

        // Update product details by merging with existing
        setProductDetails(prev => ({ ...prev, ...details }));
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds]);

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link href="/products">
              <Button variant="primary" className="px-8 py-3">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const calculateTotal = (): number => {
    return cartData.items.reduce((total: number, item: CartItem) => {
      const product = productDetails[item.partner_product_id];
      const price = product?.price || 50;
      return total + (item.quantity * price);
    }, 0);
  };

  const handleRefreshCart = () => {
    refreshCart();
    window.location.reload(); // Force refresh to re-fetch product details
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <button
              onClick={handleRefreshCart}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cart items...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="space-y-4">
                  {cartData.items.map((item: CartItem, index: number) => {
                    const product = productDetails[item.partner_product_id];
                    return (
                      <div
                        key={`${item.partner_product_id}-${index}`}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                          {product?.image_url ? (
                            <Image 
                              src={product.image_url} 
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {product?.name || `Product ${item.partner_product_id}`}
                          </h3>
                          <p className="text-gray-600">
                            £{(product?.price || 50).toFixed(2)}
                          </p>
                          {product?.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.partner_product_id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 bg-gray-100 rounded text-center min-w-[3rem]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.partner_product_id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold">
                            £{((product?.price || 50) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.partner_product_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span>£{calculateTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {cartData.guestId ? 'Guest cart - ' : ''}
                    {cartData.items.length} item{cartData.items.length !== 1 ? 's' : ''} in cart
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Link href="/products" className="flex-1">
                  <Button variant="secondary" className="w-full py-3">
                    Continue Shopping
                  </Button>
                </Link>
                <Link href="/checkout" className="flex-1">
                  <Button variant="primary" className="w-full py-3">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
