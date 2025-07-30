// components/orders/OrderList.tsx
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/Alert";
import { api } from "@/lib/api-client";
import { useSession } from "next-auth/react";
import OrderDetail from "@/components/Orders/OrderDetail";
import { withAuth } from "@/components/Auth/withAuth";
import { Order } from "@/redux/features/orders/ordersTypes";

type OrderListViewMode = "admin" | "partner" | "client";

interface OrderListProps {
  mode: OrderListViewMode;
}

const OrderList: React.FC<OrderListProps> = ({ mode }) => {
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";
  const user = session?.user;
  const filterById = user?.id || null;

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const canViewAllOrders = user?.role === "admin";
  const canViewPartnerOrders = user?.role === "partner" && filterById;
  const canViewCustomerOrders = user && filterById === user.id;

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery<Order[], Error>({
    queryKey: [
      "orders",
      { customerId: filterById, partnerId: filterById, mode },
    ],
    queryFn: () => {
      let queryString = "";
      if (filterById) {
        queryString += `customer_user_id=${filterById}`;
      }
      if (filterById) {
        queryString += `<span class="math-inline">\{queryString ? '&' \: ''\}partner\_id\=</span>{filterById}`;
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
    Order,
    Error,
    { id: string; order_status: Order["order_status"] }
  >({
    mutationFn: ({ id, order_status }) => api.patch(`/orders/${id}`, { order_status }),
    onSuccess: (_, variables) => {
      setAlert({
        type: "success",
        message: `Order ${variables.order_status} successfully!`,
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
        {mode === "client" && "Your Orders"}
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
          <table className="w-full divide-y divide-gray-200">
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
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.currency || order.currency || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.created_at || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {order.total_amount.toFixed(2)} {order.currency ?? "£"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        order.order_status === "shipped"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                      ${
                        order.order_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }
                      ${
                        order.order_status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : ""
                      }`}
                    >
                      {order.order_status}
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
                    {mode === "admin" && (order.order_status === "pending" || order.order_status === "processing") && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="ml-2"
                        onClick={() =>
                          updateOrderStatusMutation.mutate({
                            id: order.id,
                            order_status: "shipped",
                          })
                        }
                        isLoading={updateOrderStatusMutation.isPending}
                        type="button"
                      >
                        Complete
                      </Button>
                    )}
                    {mode === "admin" && order.order_status !== "cancelled" && (
                      <Button
                        variant="danger"
                        size="sm"
                        className="ml-2"
                        onClick={() =>
                          updateOrderStatusMutation.mutate({
                            id: order.id,
                            order_status: "cancelled",
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

export default withAuth(OrderList, {
  allowedRoles: ["partner", "admin", "client"],
});
