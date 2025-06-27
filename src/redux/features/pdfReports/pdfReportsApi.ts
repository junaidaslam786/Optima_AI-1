import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PdfReport, CreatePdfReport, UpdatePdfReport } from "./pdfReportsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const pdfReportsApi = createApi({
  reducerPath: "pdfReportsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/pdfReports` }),
  tagTypes: ["PdfReport"],
  endpoints: (builder) => ({
    getPdfReports: builder.query<PdfReport[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "PdfReport" as const, id })),
              "PdfReport",
            ]
          : ["PdfReport"],
    }),
    getPdfReportById: builder.query<PdfReport, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "PdfReport", id }],
    }),
    createPdfReport: builder.mutation<PdfReport, CreatePdfReport>({
      query: (newReport) => ({
        url: "",
        method: "POST",
        body: newReport,
      }),
      invalidatesTags: ["PdfReport"],
    }),
    updatePdfReport: builder.mutation<PdfReport, UpdatePdfReport>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "PdfReport", id }],
    }),
    deletePdfReport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PdfReport", id },
        "PdfReport",
      ],
    }),
  }),
});

export const {
  useGetPdfReportsQuery,
  useGetPdfReportByIdQuery,
  useCreatePdfReportMutation,
  useUpdatePdfReportMutation,
  useDeletePdfReportMutation,
} = pdfReportsApi;
