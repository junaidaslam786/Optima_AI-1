import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  PartnerProduct,
  CreatePartnerProduct,
  UpdatePartnerProduct,
} from "./partnerProductsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const partnerProductsApi = createApi({
  reducerPath: "partnerProductsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/partnerProducts` }),
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
      invalidatesTags: (result, error, { id }) => [
        { type: "PartnerProduct", id },
      ],
    }),
    deletePartnerProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PartnerProduct", id },
        "PartnerProduct",
      ],
    }),
  }),
});

export const {
  useGetPartnerProductsQuery,
  useGetPartnerProductByIdQuery,
  useCreatePartnerProductMutation,
  useUpdatePartnerProductMutation,
  useDeletePartnerProductMutation,
} = partnerProductsApi;
