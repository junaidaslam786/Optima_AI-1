"use client";

import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { OrderData } from "./GuestCheckout";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface StripePaymentFormProps {
  orderData: OrderData;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  totalAmount: number;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  orderData,
  onPaymentSuccess,
  onPaymentError,
  totalAmount,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe has not loaded yet. Please try again.");
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error("Card element not found.");
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent on the server
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: "gbp",
          orderData,
        }),
      });

      const { client_secret, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: card,
            billing_details: {
              name: `${orderData.customer.firstName} ${orderData.customer.lastName}`,
              email: orderData.customer.email,
              phone: orderData.customer.phone,
              address: {
                line1: orderData.billingAddress.address1,
                line2: orderData.billingAddress.address2 || undefined,
                city: orderData.billingAddress.city,
                postal_code: orderData.billingAddress.postalCode,
                country: orderData.billingAddress.country.toLowerCase(),
              },
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent?.status === "succeeded") {
        onPaymentSuccess(paymentIntent.id);
      } else {
        throw new Error("Payment was not successful");
      }
    } catch (error) {
      console.error("Payment error:", error);
      onPaymentError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      },
      invalid: {
        color: "#9e2146",
      },
    },
    hidePostalCode: true, // We collect this separately
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="bg-white p-3 border border-gray-300 rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Your payment information is secure and encrypted.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">Total Amount:</span>
            <span className="text-xl font-bold text-[rgb(79,135,162)]">
              £{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        isLoading={isProcessing}
        className="w-full bg-[rgb(79,135,162)] hover:bg-[rgb(69,125,152)] text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
      >
        {isProcessing ? "Processing Payment..." : `Pay £${totalAmount.toFixed(2)}`}
      </Button>

      <div className="text-center text-sm text-gray-600">
        <p>🔒 Secured by Stripe</p>
        <p className="mt-1">Your payment information is encrypted and secure.</p>
      </div>
    </form>
  );
};

interface StripePaymentProps {
  orderData: OrderData;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  totalAmount: number;
}

const StripePayment: React.FC<StripePaymentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};

export default StripePayment;
