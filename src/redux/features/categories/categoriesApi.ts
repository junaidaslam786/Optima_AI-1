// src/redux/api/categoriesApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    Category,
    CreateCategory,
    UpdateCategory,
} from "./categoriesTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const categoriesApi = createApi({
    reducerPath: "categoriesApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/categories` }), // Corrected base URL
    tagTypes: ["Category"], // Corrected tag type
    endpoints: (builder) => ({
        getCategories: builder.query<Category[], void>({
            query: () => "",
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({
                            type: "Category" as const,
                            id,
                        })),
                        "Category",
                    ]
                    : ["Category"],
        }),
        getCategoryById: builder.query<Category, string>({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "Category", id }],
        }),
        createCategory: builder.mutation<Category, CreateCategory>({
            query: (newCategory) => ({
                url: "",
                method: "POST",
                body: newCategory,
            }),
            invalidatesTags: ["Category"],
        }),
        updateCategory: builder.mutation<Category, UpdateCategory>({
            query: ({ id, ...patch }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: patch,
            }),
            invalidatesTags: (
                result,
                error,
                { id },
            ) => [{ type: "Category", id }],
        }),
        deleteCategory: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Category", id },
                "Category",
            ],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoriesApi;
