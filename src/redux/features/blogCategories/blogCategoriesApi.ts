import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    BlogCategory,
    CreateBlogCategory,
    UpdateBlogCategory,
} from "./blogCategoriesTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const blogCategoriesApi = createApi({
    reducerPath: "blogCategoriesApi",
    baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/blog-categories` }),
    tagTypes: ["BlogCategory"],
    endpoints: (builder) => ({
        getBlogCategories: builder.query<BlogCategory[], void>({
            query: () => "",
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({
                            type: "BlogCategory" as const,
                            id,
                        })),
                        "BlogCategory",
                    ]
                    : ["BlogCategory"],
        }),

        getBlogCategoryById: builder.query<BlogCategory, string>({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: "BlogCategory", id }],
        }),

        createBlogCategory: builder.mutation<BlogCategory, CreateBlogCategory>({
            query: (newCategory) => ({
                url: "",
                method: "POST",
                body: newCategory,
            }),
            invalidatesTags: ["BlogCategory"],
        }),

        updateBlogCategory: builder.mutation<BlogCategory, UpdateBlogCategory>({
            query: ({ id, ...patch }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: patch,
            }),
            invalidatesTags: (
                result,
                error,
                { id },
            ) => [{ type: "BlogCategory", id }],
        }),

        deleteBlogCategory: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (
                result,
                error,
                id,
            ) => [{ type: "BlogCategory", id }, "BlogCategory"],
        }),
    }),
});

export const {
    useGetBlogCategoriesQuery,
    useGetBlogCategoryByIdQuery,
    useCreateBlogCategoryMutation,
    useUpdateBlogCategoryMutation,
    useDeleteBlogCategoryMutation,
} = blogCategoriesApi;
