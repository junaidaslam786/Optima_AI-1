import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Marker, CreateMarker, UpdateMarker } from "./markersTypes";

const API_BASE_URL = process.env.NEXT_API_BASE_URL;

export const markersApi = createApi({
  reducerPath: "markersApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/markers` }),
  tagTypes: ["Marker"],
  endpoints: (builder) => ({
    getMarkers: builder.query<Marker[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Marker" as const, id })),
              "Marker",
            ]
          : ["Marker"],
    }),
    getMarkerById: builder.query<Marker, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Marker", id }],
    }),
    createMarker: builder.mutation<Marker, CreateMarker>({
      query: (newMarker) => ({
        url: "",
        method: "POST",
        body: newMarker,
      }),
      invalidatesTags: ["Marker"],
    }),
    updateMarker: builder.mutation<Marker, UpdateMarker>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Marker", id }],
    }),
    deleteMarker: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Marker", id },
        "Marker",
      ],
    }),
  }),
});

export const {
  useGetMarkersQuery,
  useGetMarkerByIdQuery,
  useCreateMarkerMutation,
  useUpdateMarkerMutation,
  useDeleteMarkerMutation,
} = markersApi;
