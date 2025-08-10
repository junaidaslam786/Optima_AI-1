"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import Button from "@/components/ui/Button";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";

interface CartItem {
  partner_product_id?: string;
  id?: string | number;
  quantity: number;
}

export default function CartPage() {
  const { getCartData, updateCartQuantity, removeFromCart, cartCount } = useCart();
  const cartData = getCartData();

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
            <Link href="/">
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
    // This is a placeholder - in a real app, you'd fetch product prices
    // For now, assume each item costs £50
    return cartData.items.reduce((total: number, item: CartItem) => total + (item.quantity * 50), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="space-y-4">
              {cartData.items.map((item: CartItem, index: number) => (
                <div
                  key={`${item.partner_product_id || item.id}-${index}`}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Product #{item.partner_product_id || item.id}
                    </h3>
                    <p className="text-gray-600">£50.00</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(
                        item.partner_product_id?.toString() || item.id?.toString() || "",
                        item.quantity - 1
                      )}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 bg-gray-100 rounded text-center min-w-[3rem]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(
                        item.partner_product_id?.toString() || item.id?.toString() || "",
                        item.quantity + 1
                      )}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(
                      item.partner_product_id?.toString() || item.id?.toString() || ""
                    )}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>£{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Link href="/" className="flex-1">
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
        </div>
      </div>
    </div>
  );
}
