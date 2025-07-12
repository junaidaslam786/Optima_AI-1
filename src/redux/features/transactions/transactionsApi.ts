import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Transaction, UpdateTransaction } from "./transactionsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const transactionsApi = createApi({
    reducerPath: "transactionsApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/transactions` }),
    tagTypes: ["Transaction"],
    endpoints: (builder) => ({
        getTransactions: builder.query<Transaction[], void>({
            query: () => "",
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({
                            type: "Transaction" as const,
                            id,
                        })),
                        "Transaction",
                    ]
                    : ["Transaction"],
        }),
        getTransactionById: builder.query<Transaction, string>({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "Transaction", id }],
        }),
        updateTransaction: builder.mutation<Transaction, UpdateTransaction>({
            query: ({ id, ...patch }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Transaction", id },
            ],
        }),
    }),
});

export const {
    useGetTransactionsQuery,
    useGetTransactionByIdQuery,
    useUpdateTransactionMutation,
} = transactionsApi;
