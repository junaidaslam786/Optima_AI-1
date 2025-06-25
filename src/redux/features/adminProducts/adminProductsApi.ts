import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AdminProduct,
  AdminProductImages,
  CreateAdminProduct,
  UpdateAdminProduct,
} from "./adminProductsTypes";

const API_BASE_URL = process.env.NEXT_API_BASE_URL;

export const adminProductsApi = createApi({
  reducerPath: "adminProductsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/admin-products` }),
  tagTypes: ["AdminProduct"],
  endpoints: (builder) => ({
    getAdminProducts: builder.query<AdminProduct[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "AdminProduct" as const,
                id,
              })),
              "AdminProduct",
            ]
          : ["AdminProduct"],
    }),
    getAdminProductById: builder.query<AdminProduct, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "AdminProduct", id }],
    }),
    createAdminProduct: builder.mutation<AdminProduct, CreateAdminProduct>({
      query: (newProduct) => ({
        url: "",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["AdminProduct"],
    }),
    updateAdminProduct: builder.mutation<AdminProduct, UpdateAdminProduct>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AdminProduct", id },
      ],
    }),
    addImage: builder.mutation<AdminProduct, AdminProductImages>({
      query: ({ id, product_image_urls, thumbnail_url }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: { product_image_urls, thumbnail_url },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AdminProduct", id },
      ],
    }),
    deleteImage: builder.mutation<AdminProduct, AdminProductImages>({
      query: ({ id, product_image_urls, thumbnail_url }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: { product_image_urls, thumbnail_url },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AdminProduct", id },
      ],
    }),
    deleteAdminProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "AdminProduct", id },
        "AdminProduct",
      ],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useGetAdminProductByIdQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useAddImageMutation,
  useDeleteImageMutation,
  useDeleteAdminProductMutation,
} = adminProductsApi;
