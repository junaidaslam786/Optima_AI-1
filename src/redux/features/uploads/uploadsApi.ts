import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Upload, CreateUpload, UpdateUpload } from "./uploadsTypes";

const API_BASE_URL = process.env.NEXT_API_BASE_URL;

export const uploadsApi = createApi({
  reducerPath: "uploadsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/uploads` }),
  tagTypes: ["Upload"],
  endpoints: (builder) => ({
    getUploads: builder.query<Upload[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Upload" as const, id })),
              "Upload",
            ]
          : ["Upload"],
    }),
    getUploadById: builder.query<Upload, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Upload", id }],
    }),
    createUpload: builder.mutation<Upload, CreateUpload>({
      query: (newUpload) => ({
        url: "",
        method: "POST",
        body: newUpload,
      }),
      invalidatesTags: ["Upload"],
    }),
    updateUpload: builder.mutation<Upload, UpdateUpload>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Upload", id }],
    }),
    deleteUpload: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Upload", id },
        "Upload",
      ],
    }),
  }),
});

export const {
  useGetUploadsQuery,
  useGetUploadByIdQuery,
  useCreateUploadMutation,
  useUpdateUploadMutation,
  useDeleteUploadMutation,
} = uploadsApi;
