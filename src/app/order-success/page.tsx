"use client";

import OrderConfirmation from "@/components/Orders/OrderConfirmation";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <>
      {orderId ? (
        <OrderConfirmation orderId={orderId} />
      ) : (
        <div className="text-center text-red-600">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p>
            The order ID is missing. Please check your link or go to your orders
            page.
          </p>
        </div>
      )}
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="w-full bg-primary/10 p-8 min-h-screen flex justify-center items-center">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            <LoadingSpinner />
            <p className="ml-2">Loading order details...</p>
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
