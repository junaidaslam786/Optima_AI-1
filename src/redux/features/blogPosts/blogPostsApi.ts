import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BlogPost, CreateBlogPost, UpdateBlogPost } from "./blogPostsTypes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const blogPostsApi = createApi({
  reducerPath: "blogPostsApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API_BASE_URL}/blog-posts` }),
  tagTypes: ["BlogPost"],
  endpoints: (builder) => ({
    getBlogPosts: builder.query<
      BlogPost[],
      { category_slug?: string; limit?: number; offset?: number } | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params) {
          if (params.category_slug) {
            searchParams.append("category_slug", params.category_slug);
          }
          if (params.limit) {
            searchParams.append("limit", params.limit.toString());
          }
          if (params.offset) {
            searchParams.append("offset", params.offset.toString());
          }
        }
        return searchParams.toString() ? `?${searchParams.toString()}` : "";
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "BlogPost" as const, id })),
              "BlogPost",
            ]
          : ["BlogPost"],
    }),

    getBlogPostBySlug: builder.query<BlogPost, string>({
      query: (slug) => `/${slug}`,
      providesTags: (result, error, slug) => [{ type: "BlogPost", id: slug }],
    }),

    createBlogPost: builder.mutation<BlogPost, CreateBlogPost>({
      query: (newPost) => ({
        url: "",
        method: "POST",
        body: newPost,
      }),
      invalidatesTags: ["BlogPost"],
    }),

    updateBlogPost: builder.mutation<BlogPost, UpdateBlogPost>({
      query: ({ slug, ...patch }) => ({
        url: `/${slug}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: (result, error, { slug }) => [{ type: "BlogPost", id: slug }],
    }),

    deleteBlogPost: builder.mutation<void, string>({
      query: (slug) => ({
        url: `/${slug}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, slug) => [{ type: "BlogPost", id: slug }, "BlogPost"],
    }),
  }),
});

export const {
  useGetBlogPostsQuery,
  useGetBlogPostBySlugQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
} = blogPostsApi;