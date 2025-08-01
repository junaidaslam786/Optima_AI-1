"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetBlogPostsQuery } from "@/redux/features/blogPosts/blogPostsApi";
import { useGetBlogCategoriesQuery } from "@/redux/features/blogCategories/blogCategoriesApi";
import {
  setSelectedCategorySlug,
  setSearchTerm,
  setCurrentPage,
  resetBlogFilters,
} from "@/redux/features/blogPosts/blogPostsSlice";
import Link from "next/link";
import Image from "next/image";
import {
  selectSelectedCategorySlug,
  selectSearchTerm,
  selectCurrentPage,
  selectPostsPerPage,
} from "@/redux/features/blogPosts/blogPostsSelectors";

const BlogListingPage: React.FC = () => {
  const dispatch = useDispatch();
  const selectedCategorySlug = useSelector(selectSelectedCategorySlug);
  const searchTerm = useSelector(selectSearchTerm);
  const currentPage = useSelector(selectCurrentPage);
  const postsPerPage = useSelector(selectPostsPerPage);

  const {
    data: blogPosts,
    isLoading: arePostsLoading,
    error: postsError,
  } = useGetBlogPostsQuery({
    category_slug: (selectedCategorySlug as string | null) || undefined,
    limit: postsPerPage as number,
    offset: ((currentPage as number) - 1) * (postsPerPage as number),
  });

  const {
    data: categories,
    isLoading: areCategoriesLoading,
    error: categoriesError,
  } = useGetBlogCategoriesQuery();

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    dispatch(setSelectedCategorySlug(event.target.value || null));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleResetFilters = () => {
    dispatch(resetBlogFilters());
    dispatch(setSelectedCategorySlug(null)); // Ensure category is also reset in the slice
  };

  if (arePostsLoading || areCategoriesLoading) {
    return <div>Loading blog posts...</div>;
  }

  if (postsError || categoriesError) {
    return (
      <div>
        Error loading blog posts:{" "}
        {postsError?.toString() || categoriesError?.toString()}
      </div>
    );
  }

  const filteredPosts =
    blogPosts?.filter((post) => {
      return post.title
        .toLowerCase()
        .includes(((searchTerm as string) || "").toLowerCase());
    }) || [];

  const totalPages = Math.ceil(filteredPosts.length / (postsPerPage as number));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Our Blog</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Category Filter */}
        <select
          value={
            typeof selectedCategorySlug === "string" ? selectedCategorySlug : ""
          }
          onChange={handleCategoryChange}
          className="p-2 border rounded-md"
        >
          <option value="">All Categories</option>
          {categories?.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search posts..."
          value={(searchTerm as string) || ""}
          onChange={handleSearchChange}
          className="p-2 border rounded-md flex-grow"
        />

        {/* Reset Filters */}
        <button
          onClick={handleResetFilters}
          className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="border rounded-lg shadow-md p-4 bg-white">
              {post.featured_image_url && (
                <Image
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                  width={400}
                  height={200}
                  unoptimized
                />
              )}
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-3">{post.excerpt}</p>
              <Link
                href={`/blogs/${post.slug}`}
                className="text-blue-600 hover:underline"
              >
                Read More
              </Link>
              <div className="mt-2 text-sm text-gray-500">
                {post.categories && post.categories.length > 0 && (
                  <span>
                    Categories:{" "}
                    {post.categories.map((cat) => cat.name).join(", ")}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No blog posts found.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-md ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogListingPage;
