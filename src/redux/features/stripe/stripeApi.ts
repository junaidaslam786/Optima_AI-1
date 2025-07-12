import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    CreatePaymentIntentRequest,
    CreatePaymentIntentResponse,
} from "./stripeTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const stripeApi = createApi({
    reducerPath: "stripeApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/stripe` }),
    endpoints: (builder) => ({
        createPaymentIntent: builder.mutation<
            CreatePaymentIntentResponse,
            CreatePaymentIntentRequest
        >({
            query: (paymentIntentData) => ({
                url: "/create-payment-intent",
                method: "POST",
                body: paymentIntentData,
            }),
        }),
    }),
});

export const { useCreatePaymentIntentMutation } = stripeApi;
