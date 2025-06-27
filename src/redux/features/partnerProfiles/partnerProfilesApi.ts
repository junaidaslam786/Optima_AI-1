import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PartnerProfile, CreatePartnerProfile, UpdatePartnerProfile } from './partnerProfilesTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const partnerProfilesApi = createApi({
  reducerPath: 'partnerProfilesApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/partner_profiles` }),
  tagTypes: ['PartnerProfile'],
  endpoints: (builder) => ({
    getPartnerProfiles: builder.query<PartnerProfile[], void>({
      query: () => '',
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'PartnerProfile' as const, id })), 'PartnerProfile']
          : ['PartnerProfile'],
    }),
    getPartnerProfileByUserId: builder.query<PartnerProfile[], string | undefined>({
      query: (userId) => `?user_id=${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "PartnerProfile" as const,
                id,
              })),
              "PartnerProfile",
            ]
          : ["PartnerProfile"],
    }),
    getPartnerProfileById: builder.query<PartnerProfile, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'PartnerProfile', id }],
    }),
    getApprovedPartnerProfiles: builder.query<PartnerProfile[], void>({
      query: () => '?partner_status=approved',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'PartnerProfile' as const, id })),
              { type: 'PartnerProfile', id: 'APPROVED_LIST' },
            ]
          : [{ type: 'PartnerProfile', id: 'APPROVED_LIST' }],
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
  useGetPartnerProfileByUserIdQuery,
  useGetPartnerProfileByIdQuery,
  useGetApprovedPartnerProfilesQuery,
  useCreatePartnerProfileMutation,
  useUpdatePartnerProfileMutation,
  useDeletePartnerProfileMutation,
} = partnerProfilesApi;