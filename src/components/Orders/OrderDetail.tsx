"use client";

import React, { useEffect } from "react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { useGetOrderByIdQuery } from "@/redux/features/orders/ordersApi";
import { useGetOrderItemsQuery } from "@/redux/features/orderItems/orderItemsApi";

interface OrderDetailProps {
  orderId: string;
  onBack: () => void;
  mode: "admin" | "partner" | "customer";
}

const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onBack }) => {
  const {
    data: order,
    isLoading: orderLoading,
    isError: orderError,
    error: orderErrorObj,
  } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
  });

  const {
    data: orderItems,
    isLoading: itemsLoading,
    isError: itemsError,
    error: itemsErrorObj,
  } = useGetOrderItemsQuery(undefined, {
    selectFromResult: ({ data, isLoading, isError, error }) => ({
      data: data?.filter((item) => item.order_id === orderId),
      isLoading,
      isError,
      error,
    }),
    skip: !orderId,
  });

  useEffect(() => {
    if (orderError) {
      let errorMsg = "Unknown error";
      if (orderErrorObj) {
        if (
          "message" in orderErrorObj &&
          typeof orderErrorObj.message === "string"
        ) {
          errorMsg = orderErrorObj.message;
        } else if (
          "data" in orderErrorObj &&
          typeof orderErrorObj.data === "string"
        ) {
          errorMsg = orderErrorObj.data;
        }
      }
      toast.error(`Error loading order: ${errorMsg}`);
    }
  }, [orderError, orderErrorObj]);

  useEffect(() => {
    if (itemsError) {
      let errorMsg = "Unknown error";
      if (itemsErrorObj) {
        if (
          "message" in itemsErrorObj &&
          typeof itemsErrorObj.message === "string"
        ) {
          errorMsg = itemsErrorObj.message;
        } else if (
          "data" in itemsErrorObj &&
          typeof itemsErrorObj.data === "string"
        ) {
          errorMsg = itemsErrorObj.data;
        }
      }
      toast.error(`Error loading order items: ${errorMsg}`);
    }
  }, [itemsError, itemsErrorObj]);

  if (orderLoading || itemsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading order details...</p>
      </div>
    );
  }

  if (!order || orderError) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-600 font-semibold mb-4">
          {orderError
            ? (() => {
                if (!orderErrorObj) return "Error loading order: Unknown error";
                if (
                  "message" in orderErrorObj &&
                  typeof orderErrorObj.message === "string"
                ) {
                  return `Error loading order: ${orderErrorObj.message}`;
                }
                if (
                  "data" in orderErrorObj &&
                  typeof orderErrorObj.data === "string"
                ) {
                  return `Error loading order: ${orderErrorObj.data}`;
                }
                return "Error loading order: Unknown error";
              })()
            : "Order not found."}
        </p>
        <Button onClick={onBack} className="mt-4" type="button">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={onBack} variant="secondary" type="button">
          &larr; Back to Order List
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          Order #{order.id.substring(0, 8)}
        </h1>
        <span></span>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              Order Information
            </h2>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`font-semibold
              ${order.order_status === "delivered" ? "text-green-600" : ""}
              ${order.order_status === "pending" ? "text-yellow-600" : ""}
              ${order.order_status === "cancelled" ? "text-red-600" : ""}`}
              >
                {order.order_status}
              </span>
            </p>
            <p>
              <strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}{" "}
              {order.currency}
            </p>
            <p>
              <strong>Order Date:</strong>{" "}
              {new Date(order.order_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              Customer & Partner Details
            </h2>
            <p>
              <strong>Customer:</strong>{" "}
              {order.customer_user_id || order.customer_user_id || "N/A"}
            </p>
            <p>
              <strong>Partner:</strong> {order.partner_id || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg p-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Order Items
        </h2>
        {itemsLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : orderItems?.length === 0 ? (
          <p className="text-gray-600 text-center">
            No items found for this order.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price at Purchase
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderItems?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.partner_product_id || "Unknown Product"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.price_at_purchase.toFixed(2)}{" "}
                      {order.currency ?? "£"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {(item.quantity * item.price_at_purchase).toFixed(2)}{" "}
                      {order.currency ?? "£"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
