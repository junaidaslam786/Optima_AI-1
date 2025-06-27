import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CreatePartnerProduct,
  PartnerProduct,
  UpdatePartnerProduct,
} from "./partnerProductsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const partnerProductsApi = createApi({
  reducerPath: "partnerProductsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/partner_products` }),
  tagTypes: ["PartnerProduct"],
  endpoints: (builder) => ({
    getPartnerProducts: builder.query<PartnerProduct[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "PartnerProduct" as const,
              id,
            })),
            "PartnerProduct",
          ]
          : ["PartnerProduct"],
    }),
    getPartnerProductsByPartnerId: builder.query<PartnerProduct[], string>({
      query: (partnerId) => `?partner_id=${partnerId}`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "PartnerProduct" as const,
              id,
            })),
            { type: "PartnerProduct", id: "LIST" },
          ]
          : [{ type: "PartnerProduct", id: "LIST" }],
    }),
    getPartnerProductById: builder.query<PartnerProduct, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "PartnerProduct", id }],
    }),
    createPartnerProduct: builder.mutation<
      PartnerProduct,
      CreatePartnerProduct
    >({
      query: (newProduct) => ({
        url: "",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: ["PartnerProduct"],
    }),
    updatePartnerProduct: builder.mutation<
      PartnerProduct,
      UpdatePartnerProduct
    >({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (
        result,
        error,
        { id },
      ) => [{ type: "PartnerProduct", id }],
    }),
    deletePartnerProduct: builder.mutation<null, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PartnerProduct"],
    }),
    addPartnerProductImage: builder.mutation<
      PartnerProduct,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PartnerProduct", id },
      ],
    }),
    deletePartnerProductImage: builder.mutation<
      PartnerProduct,
      {
        id: string;
        product_image_urls: string[];
        thumbnail_url?: string | null;
      }
    >({
      query: ({ id, product_image_urls, thumbnail_url }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: { product_image_urls, thumbnail_url },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PartnerProduct", id },
      ],
    }),
  }),
});

export const {
  useGetPartnerProductsQuery,
  useGetPartnerProductsByPartnerIdQuery,
  useGetPartnerProductByIdQuery,
  useCreatePartnerProductMutation,
  useUpdatePartnerProductMutation,
  useDeletePartnerProductMutation,
  useAddPartnerProductImageMutation,
  useDeletePartnerProductImageMutation,
} = partnerProductsApi;
