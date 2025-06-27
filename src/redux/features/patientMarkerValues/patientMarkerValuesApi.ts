import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  PatientMarkerValue,
  CreatePatientMarkerValue,
  UpdatePatientMarkerValue,
} from "./patientMarkerValuesTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const patientMarkerValuesApi = createApi({
  reducerPath: "patientMarkerValuesApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/patient_marker_values` }),
  tagTypes: ["PatientMarkerValue"],
  endpoints: (builder) => ({
    getPatientMarkerValues: builder.query<PatientMarkerValue[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "PatientMarkerValue" as const,
                id,
              })),
              "PatientMarkerValue",
            ]
          : ["PatientMarkerValue"],
    }),
    getPatientMarkerValueById: builder.query<PatientMarkerValue, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "PatientMarkerValue", id }],
    }),
    createPatientMarkerValue: builder.mutation<
      PatientMarkerValue,
      CreatePatientMarkerValue
    >({
      query: (newValue) => ({
        url: "",
        method: "POST",
        body: newValue,
      }),
      invalidatesTags: ["PatientMarkerValue"],
    }),
    updatePatientMarkerValue: builder.mutation<
      PatientMarkerValue,
      UpdatePatientMarkerValue
    >({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PatientMarkerValue", id },
      ],
    }),
    deletePatientMarkerValue: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PatientMarkerValue", id },
        "PatientMarkerValue",
      ],
    }),
  }),
});

export const {
  useGetPatientMarkerValuesQuery,
  useGetPatientMarkerValueByIdQuery,
  useCreatePatientMarkerValueMutation,
  useUpdatePatientMarkerValueMutation,
  useDeletePatientMarkerValueMutation,
} = patientMarkerValuesApi;
