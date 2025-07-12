import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Cart, CreateCart, UpdateCart } from "./cartsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const cartsApi = createApi({
    reducerPath: "cartsApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/carts` }),
    tagTypes: ["Cart"],
    endpoints: (builder) => ({
        getCarts: builder.query<Cart[], void>({
            query: () => "",
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({
                            type: "Cart" as const,
                            id,
                        })),
                        "Cart",
                    ]
                    : ["Cart"],
        }),
        getCartByUserId: builder.query<Cart, string>({
            query: (userId) => `/${userId}`,
            providesTags: (
                result,
                error,
                userId,
            ) => [{ type: "Cart", id: userId }],
        }),
        createCart: builder.mutation<Cart, CreateCart>({
            query: (newCart) => ({
                url: "",
                method: "POST",
                body: newCart,
            }),
            invalidatesTags: ["Cart"],
        }),
        updateCart: builder.mutation<Cart, UpdateCart>({
            query: ({ id, ...patch }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Cart", id }],
        }),
        deleteCartByUserId: builder.mutation<void, string>({
            query: (userId) => ({
                url: `/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: (
                result,
                error,
                userId,
            ) => [{ type: "Cart", id: userId }, "Cart"],
        }),
    }),
});

export const {
    useGetCartsQuery,
    useGetCartByUserIdQuery,
    useCreateCartMutation,
    useUpdateCartMutation,
    useDeleteCartByUserIdMutation,
} = cartsApi;
