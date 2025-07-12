import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CreateOrder,
  CreateOrderResponse,
  Order,
  UpdateOrder,
} from "./ordersTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ordersApi = createApi({
  reducerPath: "ordersApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/orders` }),
  tagTypes: ["Order", "Cart"],
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
    createOrder: builder.mutation<CreateOrderResponse, CreateOrder>({
      query: (newOrderData) => ({
        url: "",
        method: "POST",
        body: newOrderData,
      }),
      invalidatesTags: ["Order", "Cart"],
    }),
    updateOrder: builder.mutation<Order, UpdateOrder>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Order", id }],
    }),
    // DELETE is less common for orders, usually status updates are preferred
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
} = ordersApi;
