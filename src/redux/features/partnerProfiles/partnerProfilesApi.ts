import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PartnerProfile, CreatePartnerProfile, UpdatePartnerProfile } from './partnerProfilesTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const partnerProfilesApi = createApi({
  reducerPath: 'partnerProfilesApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/partnerProfiles` }),
  tagTypes: ['PartnerProfile'],
  endpoints: (builder) => ({
    getPartnerProfiles: builder.query<PartnerProfile[], void>({
      query: () => '',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'PartnerProfile' as const, id })), 'PartnerProfile']
          : ['PartnerProfile'],
    }),
    getPartnerProfileById: builder.query<PartnerProfile, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'PartnerProfile', id }],
    }),
    createPartnerProfile: builder.mutation<PartnerProfile, CreatePartnerProfile>({
      query: (newProfile) => ({
        url: '',
        method: 'POST',
        body: newProfile,
      }),
      invalidatesTags: ['PartnerProfile'],
    }),
    updatePartnerProfile: builder.mutation<PartnerProfile, UpdatePartnerProfile>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PartnerProfile', id }],
    }),
    deletePartnerProfile: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'PartnerProfile', id }, 'PartnerProfile'],
    }),
  }),
});

export const {
  useGetPartnerProfilesQuery,
  useGetPartnerProfileByIdQuery,
  useCreatePartnerProfileMutation,
  useUpdatePartnerProfileMutation,
  useDeletePartnerProfileMutation,
} = partnerProfilesApi;