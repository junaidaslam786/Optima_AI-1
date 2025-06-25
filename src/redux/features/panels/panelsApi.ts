import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Panel, CreatePanel, UpdatePanel } from "./panelsTypes";

const API_BASE_URL = process.env.NEXT_API_BASE_URL;

export const panelsApi = createApi({
  reducerPath: "panelsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/panels` }),
  tagTypes: ["Panel"],
  endpoints: (builder) => ({
    getPanels: builder.query<Panel[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Panel" as const, id })),
              "Panel",
            ]
          : ["Panel"],
    }),
    getPanelById: builder.query<Panel, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Panel", id }],
    }),
    createPanel: builder.mutation<Panel, CreatePanel>({
      query: (newPanel) => ({
        url: "",
        method: "POST",
        body: newPanel,
      }),
      invalidatesTags: ["Panel"],
    }),
    updatePanel: builder.mutation<Panel, UpdatePanel>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Panel", id }],
    }),
    deletePanel: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Panel", id }, "Panel"],
    }),
  }),
});

export const {
  useGetPanelsQuery,
  useGetPanelByIdQuery,
  useCreatePanelMutation,
  useUpdatePanelMutation,
  useDeletePanelMutation,
} = panelsApi;
