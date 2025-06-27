import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ProductCategory,
  CreateProductCategory,
  UpdateProductCategory,
} from "./productCategoriesTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const productCategoriesApi = createApi({
  reducerPath: "productCategoriesApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/product_categories` }),
  tagTypes: ["ProductCategory"],
  endpoints: (builder) => ({
    getProductCategories: builder.query<ProductCategory[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "ProductCategory" as const,
                id,
              })),
              "ProductCategory",
            ]
          : ["ProductCategory"],
    }),
    getProductCategoryById: builder.query<ProductCategory, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "ProductCategory", id }],
    }),
    createProductCategory: builder.mutation<
      ProductCategory,
      CreateProductCategory
    >({
      query: (newCategory) => ({
        url: "",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: ["ProductCategory"],
    }),
    updateProductCategory: builder.mutation<
      ProductCategory,
      UpdateProductCategory
    >({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ProductCategory", id },
      ],
    }),
    deleteProductCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ProductCategory", id },
        "ProductCategory",
      ],
    }),
  }),
});

export const {
  useGetProductCategoriesQuery,
  useGetProductCategoryByIdQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
} = productCategoriesApi;
