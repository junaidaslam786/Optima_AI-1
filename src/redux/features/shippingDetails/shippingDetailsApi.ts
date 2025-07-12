import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ShippingDetails, UpdateShippingDetails } from "./shippingDetailsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const shippingDetailsApi = createApi({
    reducerPath: "shippingDetailsApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/shipping_details` }),
    tagTypes: ["ShippingDetails"],
    endpoints: (builder) => ({
        getShippingDetailsByOrderId: builder.query<ShippingDetails, string>({
            query: (orderId) => `/${orderId}`,
            providesTags: (result, error, orderId) => [
                { type: "ShippingDetails", id: orderId },
            ],
        }),
        updateShippingDetails: builder.mutation<
            ShippingDetails,
            UpdateShippingDetails
        >({
            query: ({ id, ...patch }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "ShippingDetails", id },
            ],
        }),
    }),
});

export const {
    useGetShippingDetailsByOrderIdQuery,
    useUpdateShippingDetailsMutation,
} = shippingDetailsApi;
