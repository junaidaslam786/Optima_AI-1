"use client";

import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/Checkout/CheckoutForm";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const options = {
    mode: "payment" as const,
    amount: 1000,
    currency: "gbp",
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#6B46C1",
        colorBackground: "#ffffff",
        colorText: "#333333",
      },
    },
  };

  return (
    <div className="w-full bg-primary/10 p-8 min-h-screen flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Checkout
        </h1>
        {stripePromise && (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm />
          </Elements>
        )}
      </div>
    </div>
  );
}
