import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Order, CreateOrder, UpdateOrder } from "./ordersTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/orders` }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Order" as const, id })),
              "Order",
            ]
          : ["Order"],
    }),
    getOrderById: builder.query<Order, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    createOrder: builder.mutation<Order, CreateOrder>({
      query: (newOrder) => ({
        url: "",
        method: "POST",
        body: newOrder,
      }),
      invalidatesTags: ["Order"],
    }),
    updateOrder: builder.mutation<Order, UpdateOrder>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Order", id }],
    }),
    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Order", id }, "Order"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;
