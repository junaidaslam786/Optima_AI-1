"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/hooks/useCart";
import { getGuestCart, clearGuestCart } from "@/lib/guestCart";
import GuestCheckout, { OrderData } from "@/components/Checkout/GuestCheckout";
import StripePayment from "@/components/Checkout/StripePayment";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { getCartData } = useCart();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const cartData = getCartData();
  const isGuestUser = !session?.user;

  const calculateTotal = async () => {
    try {
      // Get current cart items with prices
      let total = 0;
      
      if (isGuestUser) {
        const guestCart = getGuestCart();
        for (const item of guestCart.items) {
          // Fetch product details to get price
          const response = await fetch(`/api/partner_products/${item.partner_product_id}`);
          if (response.ok) {
            const product = await response.json();
            total += product.partner_price * item.quantity;
          }
        }
      } else {
        // For authenticated users, prices should be in cartData
        cartData.items.forEach((item: { partner_products?: { partner_price?: number }; quantity: number }) => {
          total += (item.partner_products?.partner_price || 0) * item.quantity;
        });
      }
      
      return total;
    } catch (error) {
      console.error('Error calculating total:', error);
      return 0;
    }
  };

  const handleDetailsComplete = async (data: OrderData) => {
    setOrderData(data);
    
    // Calculate total amount
    const total = await calculateTotal();
    setTotalAmount(total);
    
    if (total > 0) {
      setStep('payment');
    } else {
      toast.error('Unable to calculate order total. Please try again.');
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!orderData) return;

    try {
      // Create the order with payment information
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          paymentIntentId,
          totalAmount,
          status: 'paid',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const order = await response.json();
      
      // Clear cart after successful payment
      if (isGuestUser) {
        clearGuestCart();
      }
      
      toast.success('Payment successful! Order created.');
      router.push(`/order-success?orderId=${order.id}`);
      
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('Payment succeeded but order creation failed. Please contact support.');
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
    // Stay on payment step to allow retry
  };

  const handleBackToDetails = () => {
    setStep('details');
    setOrderData(null);
    setTotalAmount(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${step === 'details' ? 'text-[rgb(79,135,162)]' : step === 'payment' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step === 'details' ? 'border-[rgb(79,135,162)] bg-[rgb(79,135,162)] text-white' : step === 'payment' ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'}`}>
                  1
                </div>
                <span className="font-medium">Details</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center space-x-2 ${step === 'payment' ? 'text-[rgb(79,135,162)]' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step === 'payment' ? 'border-[rgb(79,135,162)] bg-[rgb(79,135,162)] text-white' : 'border-gray-300'}`}>
                  2
                </div>
                <span className="font-medium">Payment</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {step === 'details' && (
                <GuestCheckout onComplete={handleDetailsComplete} />
              )}
              
              {step === 'payment' && orderData && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
                    <button
                      onClick={handleBackToDetails}
                      className="text-[rgb(79,135,162)] hover:text-[rgb(69,125,152)] font-medium"
                    >
                      ← Back to Details
                    </button>
                  </div>
                  
                  <StripePayment
                    orderData={orderData}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    totalAmount={totalAmount}
                  />
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-4">
                  {(isGuestUser ? getGuestCart().items : cartData.items).map((item: { partner_products?: { partner_name?: string; partner_price?: number }; quantity: number }, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-900">{item.partner_products?.partner_name || 'Product'}</span>
                        <span className="text-gray-500 ml-2">×{item.quantity}</span>
                      </div>
                      <span className="text-gray-900 font-medium">
                        £{((item.partner_products?.partner_price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-[rgb(79,135,162)]">
                      £{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {step === 'details' && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Review your details and proceed to payment</p>
                  </div>
                )}
                
                {step === 'payment' && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Complete your payment to place the order</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
