import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CartItem, CreateCartItem, UpdateCartItem } from "./cartItemsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const cartItemsApi = createApi({
    reducerPath: "cartItemsApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/cart_items` }),
    tagTypes: ["CartItem", "Cart"],
    endpoints: (builder) => ({
        addOrUpdateCartItem: builder.mutation<CartItem, CreateCartItem>({
            query: (item) => ({
                url: "",
                method: "POST",
                body: item,
            }),
            invalidatesTags: (result, error, { user_id }) => [
                { type: "Cart", id: user_id },
                "CartItem",
            ],
        }),
        updateCartItemQuantity: builder.mutation<CartItem, UpdateCartItem>({
            query: ({ id, quantity }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: { quantity },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "CartItem", id },
                "Cart",
            ],
        }),
        deleteCartItem: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "CartItem", id },
                "Cart",
            ],
        }),
    }),
});

export const {
    useAddOrUpdateCartItemMutation,
    useUpdateCartItemQuantityMutation,
    useDeleteCartItemMutation,
} = cartItemsApi;
