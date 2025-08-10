"use client";

import React, { useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { useGetOrderByIdQuery } from "@/redux/features/orders/ordersApi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query"; // Import FetchBaseQueryError
import { SerializedError } from "@reduxjs/toolkit"; // Import SerializedError

interface OrderConfirmationProps {
  orderId: string;
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId }) => {
  const router = useRouter();
  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useGetOrderByIdQuery(orderId);

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
    if (isError) {
      toast.error(`Failed to load order details: ${getErrorMessage(error)}`);
    }
  }, [isError, error]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8 min-h-[50vh]">
        <LoadingSpinner />
        <p className="ml-2">Loading order details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full text-center text-red-600 mt-10">
        <Alert type="error" message={`Error: ${getErrorMessage(error)}`} />
        <Button className="mt-4" onClick={() => router.push("/orders")}>
          View All Orders
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full text-center text-gray-600 mt-10">
        <p>Order not found.</p>
        <Button className="mt-4" onClick={() => router.push("/orders")}>
          View All Orders
        </Button>
      </div>
    );
  }

  const shippingDetails = order.shipping_details;

  return (
    <div className="container mx-auto p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-4xl font-extrabold text-green-700 mb-6 text-center">
        Order Confirmed! 🎉
      </h1>
      <p className="text-center text-lg text-gray-700 mb-8">
        Thank you for your purchase! Your order #{order.id} has been placed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Order Summary
          </h2>
          <p className="text-gray-700">
            <strong>Order Date:</strong>{" "}
            {new Date(order.order_date).toLocaleDateString()}
          </p>
          <p className="text-gray-700">
            <strong>Total Amount:</strong> {order.total_amount.toFixed(2)}{" "}
            {order.currency}
          </p>
          <p
            className={`font-semibold ${
              order.payment_status === "paid"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            <strong>Payment Status:</strong> {order.payment_status}
          </p>
          <p
            className={`font-semibold ${
              order.order_status === "processing"
                ? "text-blue-600"
                : "text-gray-600"
            }`}
          >
            <strong>Order Status:</strong> {order.order_status}
          </p>
          <p className="text-gray-700">
            <strong>Ordered from:</strong>{" "}
            {order.partner_profiles?.company_name || "N/A"}
          </p>
        </div>

        {shippingDetails && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Shipping Details
            </h2>
            <p className="text-gray-700">
              <strong>Recipient:</strong> {shippingDetails.recipient_name}
            </p>
            <p className="text-gray-700">
              <strong>Address:</strong> {shippingDetails.address_line1}
              {shippingDetails.address_line2 &&
                `, ${shippingDetails.address_line2}`}
              , {shippingDetails.city}, {shippingDetails.postal_code}
              {shippingDetails.state_province &&
                `, ${shippingDetails.state_province}`}
              , {shippingDetails.country}
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> {shippingDetails.phone_number}
            </p>
            <p className="text-gray-700">
              <strong>Shipping Method:</strong>{" "}
              {shippingDetails.shipping_method}
            </p>
            {shippingDetails.tracking_number && (
              <p className="text-gray-700">
                <strong>Tracking Number:</strong>{" "}
                <a
                  href={shippingDetails.tracking_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {shippingDetails.tracking_number}
                </a>
              </p>
            )}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Items Ordered
      </h2>
      <div className="space-y-4 mb-8">
        {order.order_items?.map((item) => (
          <div
            key={item.id}
            className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm"
          >
            <div className="relative w-20 h-20 mr-4 flex-shrink-0">
              <Image
                src={
                  item.partner_products?.thumbnail_url ||
                  item.partner_products?.product_image_urls?.[0] ||
                  "/medical-kit.jpg"
                }
                alt={item.partner_products?.partner_name || "Product Image"}
                layout="fill"
                objectFit="cover"
                className="rounded-md"
                unoptimized
                onError={(e) => {
                  e.currentTarget.src = "/medical-kit.jpg";
                }}
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-800">
                {item.partner_products?.partner_name || "Unnamed Product"}
              </h3>
              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              <p className="text-md font-medium text-primary">
                {item.price_at_purchase.toFixed(2)} each
              </p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {(item.quantity * item.price_at_purchase).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button variant="primary" onClick={() => router.push("/orders")}>
          View All Your Orders
        </Button>
        <Button
          variant="secondary"
          className="ml-4"
          onClick={() => router.push("/products")}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
