import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { User, CreateUser, UpdateUser } from "./usersTypes";
import { RootState } from "@/redux/store";

const API_BASE_URL = process.env.NEXT_API_BASE_URL;

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/users`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "",
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "User" as const, id })), "User"]
          : ["User"],
    }),
    getUserById: builder.query<User, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation<User, CreateUser>({
      query: (newUser) => ({
        url: "",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<User, UpdateUser>({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }, "User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
