import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { OrderItem, UpdateOrderItem } from "./orderItemsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const orderItemsApi = createApi({
  reducerPath: "orderItemsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/order_items` }),
  tagTypes: ["OrderItem"],
  endpoints: (builder) => ({
    getOrderItems: builder.query<OrderItem[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "OrderItem" as const, id })),
            "OrderItem",
          ]
          : ["OrderItem"],
    }),
    getOrderItemById: builder.query<OrderItem, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "OrderItem", id }],
    }),
    updateOrderItem: builder.mutation<OrderItem, UpdateOrderItem>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "OrderItem", id }],
    }),
    deleteOrderItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (
        result,
        error,
        id,
      ) => [{ type: "OrderItem", id }, "OrderItem"],
    }),
  }),
});

export const {
  useGetOrderItemsQuery,
  useGetOrderItemByIdQuery,
  useUpdateOrderItemMutation,
  useDeleteOrderItemMutation,
} = orderItemsApi;
