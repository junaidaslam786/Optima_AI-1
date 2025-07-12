"use client";

import React, { useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "@/components/Checkout/CheckoutForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const router = useRouter();
  const userId = useAppSelector((state) => state.users.selectedUserId);

  useEffect(() => {
    // Redirect if user is not logged in
    if (!userId) {
      router.push("/login");
    }
  }, [userId, router]);

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading user session...</p>
      </div>
    );
  }

  // Options for Stripe Elements (e.g., appearance)
  const options = {
    mode: "payment" as const, // Explicitly set mode to 'payment' with 'as const'
    amount: 1000, // Dummy amount, will be overridden by payment intent
    currency: "gbp", // Default currency, will be overridden
    // You can customize the appearance of the Elements here
    appearance: {
      theme: "stripe" as const, // Explicitly set theme to 'stripe' with 'as const'
      variables: {
        colorPrimary: "#6B46C1", // primary color
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
            <CheckoutForm userId={userId} />
          </Elements>
        )}
      </div>
    </div>
  );
}
