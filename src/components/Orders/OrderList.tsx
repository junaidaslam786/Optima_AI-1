// components/orders/OrderList.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import { api } from "@/lib/api-client";
import { OrderWithDetails } from "@/types/db";
import { useSession } from "next-auth/react";
import OrderDetail from "./OrderDetail";

type OrderListViewMode = "admin" | "partner" | "customer";

interface OrderListProps {
  mode: OrderListViewMode;
  filterByUserId?: string;
  filterByPartnerId?: string;
}

const OrderList: React.FC<OrderListProps> = ({
  mode,
  filterByUserId,
  filterByPartnerId,
}) => {
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const user = session?.user;
  const sessionLoading = status === "loading";

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const canViewAllOrders = user?.role === "admin";
  const canViewPartnerOrders = user?.role === "partner" && filterByPartnerId;
  const canViewCustomerOrders = user && filterByUserId === user.id;

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery<OrderWithDetails[], Error>({
    queryKey: [
      "orders",
      { customerId: filterByUserId, partnerId: filterByPartnerId, mode },
    ],
    queryFn: () => {
      let queryString = "";
      if (filterByUserId) {
        queryString += `customer_user_id=${filterByUserId}`;
      }
      if (filterByPartnerId) {
        queryString += `<span class="math-inline">\{queryString ? '&' \: ''\}partner\_id\=</span>{filterByPartnerId}`;
      }
      return api.get(`/orders${queryString ? `?${queryString}` : ""}`);
    },
    enabled: !!(
      !sessionLoading &&
      user &&
      (canViewAllOrders || canViewPartnerOrders || canViewCustomerOrders)
    ),
  });

  const updateOrderStatusMutation = useMutation<
    OrderWithDetails,
    Error,
    { id: string; status: OrderWithDetails["status"] }
  >({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}`, { status }),
    onSuccess: (_, variables) => {
      setAlert({
        type: "success",
        message: `Order ${variables.status} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
    onError: (err) => {
      setAlert({
        type: "error",
        message: `Failed to update order status: ${err.message}`,
      });
    },
  });

  if (sessionLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Checking authentication...</p>
      </div>
    );
  }

  if (
    !user ||
    (mode === "admin" && user.role !== "admin") ||
    (mode === "partner" && user.role !== "partner") ||
    (mode === "customer" && user.id !== filterByUserId)
  ) {
    return (
      <div className="text-center mt-10 p-6 bg-red-50 border border-red-200 text-red-800 rounded-lg mx-auto max-w-md">
        <p className="font-semibold">
          Access Denied: You do not have permission to view these orders.
        </p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => (window.location.href = "/")}
        >
          Go to Home
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
        <p className="ml-2">Loading orders...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-600 mt-10">
        Error: {error?.message || "Failed to load orders"}
      </div>
    );
  }

  if (selectedOrderId) {
    return (
      <OrderDetail
        orderId={selectedOrderId}
        onBack={() => setSelectedOrderId(null)}
        mode={mode}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        {mode === "admin" && "All Orders"}
        {mode === "partner" && "Your Partner Orders"}
        {mode === "customer" && "Your Orders"}
      </h1>
      {alert && (
        <div className="mb-6">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {orders?.length === 0 ? (
        <p className="text-gray-600 text-center py-8 text-lg">
          No orders found.
        </p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-xl rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Partner
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.users?.name || order.users?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.partner_profiles?.company_name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${order.total_amount.toFixed(2)} {order.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                      ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }
                      ${
                        order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : ""
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedOrderId(order.id)}
                      type="button"
                    >
                      View Details
                    </Button>
                    {mode === "admin" && order.status === "pending" && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="ml-2"
                        onClick={() =>
                          updateOrderStatusMutation.mutate({
                            id: order.id,
                            status: "completed",
                          })
                        }
                        isLoading={updateOrderStatusMutation.isPending}
                        type="button"
                      >
                        Complete
                      </Button>
                    )}
                    {mode === "admin" && order.status !== "cancelled" && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="ml-2"
                        onClick={() =>
                          updateOrderStatusMutation.mutate({
                            id: order.id,
                            status: "cancelled",
                          })
                        }
                        isLoading={updateOrderStatusMutation.isPending}
                        type="button"
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderList;
