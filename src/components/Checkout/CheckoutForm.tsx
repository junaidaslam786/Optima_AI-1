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
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { useSession } from "next-auth/react";
import { withAuth } from "../Auth/withAuth";

const CheckoutForm: React.FC = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id || "";
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

  const getErrorMessage = (
    error: FetchBaseQueryError | SerializedError | undefined
  ): string => {
    if (!error) return "An unknown error occurred.";

    if ("status" in error) {
      if (
        typeof error.data === "object" &&
        error.data !== null &&
        "error" in error.data &&
        typeof error.data.error === "string"
      ) {
        return error.data.error;
      }
      return `API Error: ${error.status}`;
    } else if ("message" in error) {
      return error.message || "An unexpected client-side error occurred.";
    }
    return "An unknown error occurred.";
  };

  useEffect(() => {
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
    const { error: submitError } = await elements.submit();

    if (submitError) {
      console.error("[Stripe Elements Error]", submitError);
      toast.error(`Payment details error: ${submitError.message}`);
      setIsPaymentProcessing(false);
      return;
    }

    const partnerId = "5105e515-1536-4b36-8d98-1eb4198e7ea2";
    if (!partnerId) {
      toast.error("Could not determine partner for the order.");
      setIsPaymentProcessing(false);
      return;
    }

    try {
      const createOrderResponse = await createOrder({
        cart_id: cartData.id,
        user_email: cartData.user?.email || "guest@example.com",
        user_name: cartData.user?.name || shippingDetails.recipient_name,
        shipping_details: {
          ...shippingDetails,
          shipping_cost: 0,
          shipping_method: "Standard Shipping",
        },
        payment_method_id: "pm_card_visa",
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

      if (createOrderResponse.paymentStatus === "paid") {
        toast.success(
          "Payment already successful! Redirecting to order confirmation..."
        );
        router.push(`/order-success?order_id=${createOrderResponse.order_id}`);
        setIsPaymentProcessing(false);
        return;
      }

      if (createOrderResponse.clientSecret) {
        const { error: stripeConfirmError, paymentIntent } =
          await stripe.confirmPayment({
            elements,
            clientSecret: createOrderResponse.clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/order-success?order_id=${createOrderResponse.order_id}`,
              shipping: {
                name: shippingDetails.recipient_name,
                address: {
                  line1: shippingDetails.address_line1,
                  line2: shippingDetails.address_line2,
                  city: shippingDetails.city,
                  state: shippingDetails.state_province,
                  postal_code: shippingDetails.postal_code,
                  country: shippingDetails.country,
                },
              },
            },
            redirect: "if_required",
          });

        if (stripeConfirmError) {
          console.error("[Stripe Confirm Error]", stripeConfirmError);
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
          router.push(
            `/order-success?order_id=${createOrderResponse.order_id}`
          );
        } else if (
          paymentIntent &&
          paymentIntent.status === "requires_action"
        ) {
          toast(
            "Payment requires additional action. Please complete the verification."
          );
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
          name="recipient_name"
          value={shippingDetails.recipient_name}
          onChange={handleShippingChange}
          required
        />
        <Input
          label="Phone Number"
          id="phone_number"
          name="phone_number"
          value={shippingDetails.phone_number}
          onChange={handleShippingChange}
          required
        />
      </div>
      <Input
        label="Address Line 1"
        id="address_line1"
        name="address_line1"
        value={shippingDetails.address_line1}
        onChange={handleShippingChange}
        required
      />
      <Input
        label="Address Line 2 (Optional)"
        id="address_line2"
        name="address_line2"
        value={shippingDetails.address_line2}
        onChange={handleShippingChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="City"
          id="city"
          name="city"
          value={shippingDetails.city}
          onChange={handleShippingChange}
          required
        />
        <Input
          label="State/Province"
          id="state_province"
          name="state_province"
          value={shippingDetails.state_province}
          onChange={handleShippingChange}
        />
        <Input
          label="Postal Code"
          id="postal_code"
          name="postal_code"
          value={shippingDetails.postal_code}
          onChange={handleShippingChange}
          required
        />
      </div>
      <Input
        label="Country"
        id="country"
        name="country"
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
          Order Total: £{totalAmount?.toFixed(2)}
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

export default withAuth(CheckoutForm, { allowedRoles: ["client"] });
