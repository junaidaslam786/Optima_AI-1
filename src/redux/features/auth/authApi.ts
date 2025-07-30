// src/redux/features/auth/authApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    ChangePasswordRequest,
    ChangePasswordResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
} from "./authTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/auth`,
    }),
    endpoints: (builder) => ({
        forgotPassword: builder.mutation<
            ForgotPasswordResponse,
            ForgotPasswordRequest
        >({
            query: (body) => ({
                url: "/forgot-password",
                method: "POST",
                body,
            }),
        }),
        changePassword: builder.mutation<
            ChangePasswordResponse,
            ChangePasswordRequest
        >({
            query: ({ newPassword, accessToken }) => ({
                url: "/change-password",
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`,
                },
                body: { newPassword },
            }),
        }),
    }),
});

export const { useForgotPasswordMutation, useChangePasswordMutation } = authApi;
