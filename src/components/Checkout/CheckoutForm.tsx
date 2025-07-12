"use client";

import React, { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCreateOrderMutation } from "@/redux/features/orders/ordersApi";
import { useGetCartByUserIdQuery } from "@/redux/features/carts/cartsApi";
import { useAppDispatch } from "@/redux/hooks";
import { setPaymentIntentDetails } from "@/redux/features/stripe/stripeSlice";
import LoadingSpinner from "../ui/LoadingSpinner";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"; // Import FetchBaseQueryError
import { SerializedError } from "@reduxjs/toolkit"; // Import SerializedError

interface CheckoutFormProps {
  userId: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ userId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    data: cartData,
    isLoading: isLoadingCart,
    isError: isCartError,
    error: cartError,
  } = useGetCartByUserIdQuery(userId);

  const [createOrder, { isLoading: isProcessingOrder }] =
    useCreateOrderMutation();

  const [shippingDetails, setShippingDetails] = useState({
    recipient_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "",
    phone_number: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Helper function to get the error message safely
  const getErrorMessage = (
    error: FetchBaseQueryError | SerializedError | undefined
  ): string => {
    if (!error) return "An unknown error occurred.";

    if ("status" in error) {
      // This is a FetchBaseQueryError (e.g., from your API)
      if (
        typeof error.data === "object" &&
        error.data !== null &&
        "error" in error.data &&
        typeof error.data.error === "string"
      ) {
        return error.data.error; // Assuming your API returns { error: "message" }
      }
      return `API Error: ${error.status}`;
    } else if ("message" in error) {
      // This is a SerializedError
      return error.message || "An unexpected client-side error occurred.";
    }
    return "An unknown error occurred.";
  };

  useEffect(() => {
    // Basic form validation
    const {
      recipient_name,
      address_line1,
      city,
      postal_code,
      country,
      phone_number,
    } = shippingDetails;
    setIsFormValid(
      !!recipient_name &&
        !!address_line1 &&
        !!city &&
        !!postal_code &&
        !!country &&
        !!phone_number &&
        !isLoadingCart &&
        !isCartError &&
        (cartData?.cart_items?.length || 0) > 0
    );
  }, [shippingDetails, isLoadingCart, isCartError, cartData]);

  useEffect(() => {
    if (isCartError) {
      // No need to check 'cartError' here, as isCartError implies error exists
      toast.error(`Failed to load cart: ${getErrorMessage(cartError)}`);
    }
  }, [isCartError, cartError]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsPaymentProcessing(true);

    if (
      !stripe ||
      !elements ||
      !cartData ||
      !cartData.cart_items ||
      cartData.cart_items.length === 0
    ) {
      toast.error("Stripe.js has not loaded or cart is empty.");
      setIsPaymentProcessing(false);
      return;
    }

    // Get the first partner ID from the cart items.
    // In a multi-partner scenario, you'd need more complex logic (e.g., multiple orders).
    const partnerId = cartData.cart_items[0]?.partner_products?.partner_id;
    if (!partnerId) {
      toast.error("Could not determine partner for the order.");
      setIsPaymentProcessing(false);
      return;
    }

    try {
      // 1. Create the Order and Payment Intent on your backend
      const createOrderResponse = await createOrder({
        cart_id: cartData.id,
        user_email: cartData.user?.email || "guest@example.com", // Fallback for guest, though user_id should be present
        user_name: cartData.user?.name || shippingDetails.recipient_name,
        shipping_details: {
          ...shippingDetails,
          shipping_cost: 0, // Assuming free shipping for now, or calculate
          shipping_method: "Standard Shipping", // Default method
        },
        payment_method_id: "pm_card_visa", // This will be replaced by Stripe.js token/ID
        partner_id: partnerId,
      }).unwrap();

      dispatch(
        setPaymentIntentDetails({
          clientSecret: createOrderResponse.clientSecret || null,
          paymentStatus: createOrderResponse.paymentStatus,
          error: createOrderResponse.error,
        })
      );

      if (createOrderResponse.error) {
        toast.error(`Order creation failed: ${createOrderResponse.error}`);
        setIsPaymentProcessing(false);
        return;
      }

      if (createOrderResponse.clientSecret) {
        // 2. Confirm the payment on the client-side using the client secret
        const { error: stripeConfirmError, paymentIntent } =
          await stripe.confirmPayment({
            elements,
            clientSecret: createOrderResponse.clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/order-success?order_id=${createOrderResponse.order_id}`, // Redirect after payment
              // Add shipping details here if you want Stripe to handle them directly
              // shipping: {
              //   name: shippingDetails.recipient_name,
              //   address: {
              //     line1: shippingDetails.address_line1,
              //     line2: shippingDetails.address_line2,
              //     city: shippingDetails.city,
              //     state: shippingDetails.state_province,
              //     postal_code: shippingDetails.postal_code,
              //     country: shippingDetails.country,
              //   },
              // },
            },
            redirect: "if_required", // Only redirect if necessary (e.g., 3D Secure)
          });

        if (stripeConfirmError) {
          console.error("[Stripe Error]", stripeConfirmError);
          toast.error(`Payment failed: ${stripeConfirmError.message}`);
          dispatch(
            setPaymentIntentDetails({
              clientSecret: null,
              paymentStatus: "failed",
              error: stripeConfirmError.message,
            })
          );
          setIsPaymentProcessing(false);
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          toast.success(
            "Payment successful! Redirecting to order confirmation..."
          );
          // The webhook will update your DB, but you can redirect immediately
          router.push(
            `/order-success?order_id=${createOrderResponse.order_id}`
          );
        } else if (
          paymentIntent &&
          paymentIntent.status === "requires_action"
        ) {
          // Handle 3D Secure or other required actions
          toast(
            "Payment requires additional action. Please complete the verification."
          );
          // Stripe.js will handle the redirect for confirmation
        } else {
          toast.error(
            "Payment failed or was not successful. Please try again."
          );
          dispatch(
            setPaymentIntentDetails({
              clientSecret: null,
              paymentStatus: paymentIntent?.status || "failed",
              error: "Payment not successful",
            })
          );
          setIsPaymentProcessing(false);
        }
      } else {
        toast.error("Failed to get client secret from order creation.");
        setIsPaymentProcessing(false);
      }
    } catch (err: unknown) {
      // Changed 'any' to 'unknown'
      console.error("Error during checkout process:", err);
      toast.error(
        `Checkout failed: ${getErrorMessage(
          err as FetchBaseQueryError | SerializedError
        )}`
      );
      dispatch(
        setPaymentIntentDetails({
          clientSecret: null,
          paymentStatus: "failed",
          error: getErrorMessage(err as FetchBaseQueryError | SerializedError),
        })
      );
      setIsPaymentProcessing(false);
    }
  };

  if (isLoadingCart) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner />
        <p className="ml-2">Loading cart for checkout...</p>
      </div>
    );
  }

  if (isCartError || !cartData || cartData.cart_items?.length === 0) {
    return (
      <div className="text-center text-red-600">
        <p>
          Error: Could not load cart or cart is empty. Please go back to cart.
        </p>
        <Button className="mt-4" onClick={() => router.push("/cart")}>
          Go to Cart
        </Button>
      </div>
    );
  }

  const totalAmount = cartData.cart_items?.reduce(
    (sum, item) => sum + item.quantity * item.price_at_addition,
    0
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Shipping Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Recipient Name"
          id="recipient_name"
          name="recipient_name" // Added name prop for consistency
          value={shippingDetails.recipient_name}
          onChange={handleShippingChange}
          required
        />
        <Input
          label="Phone Number"
          id="phone_number"
          name="phone_number" // Added name prop for consistency
          value={shippingDetails.phone_number}
          onChange={handleShippingChange}
          required
        />
      </div>
      <Input
        label="Address Line 1"
        id="address_line1"
        name="address_line1" // Added name prop for consistency
        value={shippingDetails.address_line1}
        onChange={handleShippingChange}
        required
      />
      <Input
        label="Address Line 2 (Optional)"
        id="address_line2"
        name="address_line2" // Added name prop for consistency
        value={shippingDetails.address_line2}
        onChange={handleShippingChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="City"
          id="city"
          name="city" // Added name prop for consistency
          value={shippingDetails.city}
          onChange={handleShippingChange}
          required
        />
        <Input
          label="State/Province"
          id="state_province"
          name="state_province" // Added name prop for consistency
          value={shippingDetails.state_province}
          onChange={handleShippingChange}
        />
        <Input
          label="Postal Code"
          id="postal_code"
          name="postal_code" // Added name prop for consistency
          value={shippingDetails.postal_code}
          onChange={handleShippingChange}
          required
        />
      </div>
      <Input
        label="Country"
        id="country"
        name="country" // Added name prop for consistency
        value={shippingDetails.country}
        onChange={handleShippingChange}
        required
      />

      <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
        Payment Information
      </h2>
      <PaymentElement options={{ layout: "tabs" }} />

      <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
        <p className="text-xl font-bold text-gray-900">
          Order Total: ${totalAmount?.toFixed(2)}
        </p>
        <Button
          type="submit"
          variant="primary"
          isLoading={isProcessingOrder || isPaymentProcessing}
          disabled={
            !stripe ||
            !elements ||
            !isFormValid ||
            isProcessingOrder ||
            isPaymentProcessing
          }
          className="px-8 py-3 text-lg"
        >
          {isProcessingOrder || isPaymentProcessing
            ? "Processing..."
            : "Pay Now"}
        </Button>
      </div>
    </form>
  );
};

export default CheckoutForm;
