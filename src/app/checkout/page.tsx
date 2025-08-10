"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GuestCheckout, { OrderData } from "@/components/Checkout/GuestCheckout";

export default function CheckoutPage() {
  const router = useRouter();

  const handleCheckoutComplete = (orderData: OrderData) => {
    console.log('Order completed:', orderData);
    // For now, redirect to a generic success page
    // You'll need to implement the order success page
    router.push('/order-success');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <GuestCheckout onComplete={handleCheckoutComplete} />
      </div>
    </div>
  );
}
