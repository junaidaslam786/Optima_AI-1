import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    CreateUserConsent,
    GetUserConsentParams,
    UserConsent,
} from "./userConsentsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const userConsentsApi = createApi({
    reducerPath: "userConsentsApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/user-consents` }),
    tagTypes: ["UserConsent"],
    endpoints: (builder) => ({
        recordUserConsent: builder.mutation<UserConsent, CreateUserConsent>({
            query: (newConsent) => ({
                url: "",
                method: "POST",
                body: newConsent,
            }),
            invalidatesTags: (result, error, { user_id }) =>
                user_id
                    ? [{ type: "UserConsent", id: user_id }]
                    : ["UserConsent"],
        }),

        getUserConsents: builder.query<
            UserConsent | UserConsent[],
            GetUserConsentParams
        >({
            query: ({ userId, consent_type, latest_only }) => {
                const searchParams = new URLSearchParams();
                if (consent_type) {
                    searchParams.append("consent_type", consent_type);
                }
                if (latest_only) {
                    searchParams.append("latest_only", "true");
                }
                return `/${userId}${
                    searchParams.toString() ? `?${searchParams.toString()}` : ""
                }`;
            },
            providesTags: (
                result,
                error,
                { userId },
            ) => [{ type: "UserConsent", id: userId }],
        }),
    }),
});

export const {
    useRecordUserConsentMutation,
    useGetUserConsentsQuery,
} = userConsentsApi;
